const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Global browser shims
global.window = global;
global.window.addEventListener = () => {};
global.window.location = { protocol: 'https:', hostname: 'veskymak.github.io' };
const storageStore = {};
global.localStorage = {
    getItem: (key) => storageStore[key] ?? null,
    setItem: (key, val) => { storageStore[key] = String(val); },
    removeItem: (key) => { delete storageStore[key]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

const elementsMap = {};
function createMockElement(id, initialVal = '') {
    return {
        id,
        className: '',
        textContent: '',
        innerHTML: '',
        value: initialVal,
        classList: {
            contains: () => false,
            add: () => {},
            remove: () => {}
        }
    };
}

global.document = {
    readyState: 'complete',
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({
        className: '',
        textContent: '',
        appendChild: () => {}
    })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Shims for user state
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'sb_jwt_user_vendeez_1',
    backendConnected: true,
    isSupabase: true
};

global.mpState = {
    myId: 'peer_vendeez_123',
    nickname: 'Vendeez',
    remotePlayers: {}
};

global.sfx = {
    playCoin: () => {},
    playWinFanfare: () => {}
};

let hudToastMessages = [];
global.showHudToast = (msg, color) => {
    hudToastMessages.push({ msg, color });
};

let socialBroadcasts = [];
global.sendSocialBroadcast = (event, payload) => {
    socialBroadcasts.push({ event, payload });
};

const PortalUI = require('../src/ui/PortalUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 2: Friends Persistence & Cross-Device Synchronization', () => {
    beforeEach(() => {
        hudToastMessages = [];
        socialBroadcasts = [];
        storageStore['boblox_friends_list'] = '[]';
        storageStore['boblox_sent_friend_requests'] = '{}';
        storageStore['boblox_received_friend_requests'] = '{}';
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000, inventory: { friends: [] } };
    });

    it('hasSentFriendRequest returns false if the target user is already in friendsSet', () => {
        // Target is Max
        const maxPlayer = { id: 'cloud_max', username: 'Max', displayName: 'Max' };

        // Before adding as friend, send request
        PortalUI.sendFriendRequest('cloud_max');
        assert.strictEqual(PortalUI.hasSentFriendRequest(maxPlayer), true, 'Request should be marked as sent');

        // Now Max is confirmed as a friend
        PortalUI.friendsSet.add('max');

        // hasSentFriendRequest must NOT report true for an existing friend
        assert.strictEqual(PortalUI.hasSentFriendRequest(maxPlayer), false, 'Should return false when player is already a friend');
        assert.strictEqual(PortalUI.isPlayerFriend(maxPlayer), true, 'Should recognize Max as a friend');
    });

    it('applyAuthenticatedUser clears sent requests when friends list arrives from backend sync', () => {
        // Setup initial sent request in state
        PortalUI.sentFriendRequests['cloud_max'] = { id: 'cloud_max', username: 'Max' };
        PortalUI.sentFriendRequests['max'] = { id: 'cloud_max', username: 'Max' };

        // User logs in on PC, backend user object has Max in friends
        const userFromBackend = {
            id: 1,
            username: 'Vendeez',
            coins: 5000,
            inventory: {
                friends: ['max'],
                sent_friend_requests: []
            }
        };

        PortalStore.applyAuthenticatedUser(userFromBackend);

        // Friends set should contain max
        assert.strictEqual(PortalUI.friendsSet.has('max'), true, 'Max should be in friendsSet');
        // Sent friend requests for max should be purged so PC does not show "Žádost odeslána"
        assert.strictEqual(Boolean(PortalUI.sentFriendRequests['max']), false, 'sentFriendRequests[max] should be purged');
        assert.strictEqual(Boolean(PortalUI.sentFriendRequests['cloud_max']), false, 'sentFriendRequests[cloud_max] should be purged');
    });

    it('toggleFriendStatus removes player from sentFriendRequests and immediately persists', () => {
        PortalUI.sentFriendRequests['cloud_max'] = { id: 'cloud_max', username: 'Max' };
        PortalUI.friendsSet.delete('max');

        PortalUI.toggleFriendStatus('cloud_max');

        assert.strictEqual(PortalUI.friendsSet.has('max'), true, 'Max should now be a friend');
        assert.strictEqual(Boolean(PortalUI.sentFriendRequests['cloud_max']), false, 'Pending request should be cleared');
        assert.strictEqual(PortalUI.hasSentFriendRequest('cloud_max'), false, 'hasSentFriendRequest should be false');
    });

    it('applyAuthenticatedUser restores incoming received friend requests across devices', () => {
        // Incoming request sent to Vendeez from another device
        const incomingReq = {
            id: 'cloud_max',
            username: 'Max',
            receivedAt: Date.now()
        };

        const userWithIncomingRequests = {
            id: 1,
            username: 'Vendeez',
            coins: 5000,
            inventory: {
                friends: [],
                received_friend_requests: [incomingReq]
            }
        };

        PortalStore.applyAuthenticatedUser(userWithIncomingRequests);

        assert.strictEqual(Boolean(PortalUI.receivedFriendRequests['cloud_max'] || PortalUI.receivedFriendRequests['max']), true, 'Incoming request should be restored');
    });

    it('handleOfflineApiFallback persists friend request and acceptance to target user', async () => {
        const users = [
            { id: 1, username: 'Vendeez', coins: 1000, inventory: {} },
            { id: 2, username: 'Max', coins: 500, inventory: { received_friend_requests: [] } }
        ];
        PortalStore.saveLocalUsersDB(users);

        // Vendeez sends friend request to Max
        const reqRes = await PortalStore.handleOfflineApiFallback('/api/friends/request', {
            method: 'POST',
            body: { targetUsername: 'Max', sender: { senderProfile: { username: 'Vendeez' } } }
        });
        assert.strictEqual(reqRes.ok, true);

        const loadedUsers = PortalStore.getLocalUsersDB();
        const maxUser = loadedUsers.find(u => u.username === 'Max');
        assert.strictEqual(maxUser.inventory.received_friend_requests.length, 1);
        assert.strictEqual(maxUser.inventory.received_friend_requests[0].username, 'Vendeez');

        // Max accepts friend request from Vendeez
        global.authState.user = { id: 2, username: 'Max', inventory: maxUser.inventory };
        const acceptRes = await PortalStore.handleOfflineApiFallback('/api/friends/accept', {
            method: 'POST',
            body: { targetUsername: 'Vendeez' }
        });
        assert.strictEqual(acceptRes.ok, true);

        const loadedAfterAccept = PortalStore.getLocalUsersDB();
        const vendeezUser = loadedAfterAccept.find(u => u.username === 'Vendeez');
        assert.ok(vendeezUser.inventory.friends.includes('max'), 'Max should be added to Vendeez friends list');
    });

    it('handleSupabaseApiRequest persists friend request and accept to Supabase profile', async () => {
        let updateCalledWith = null;
        const mockTargetProfile = {
            id: 'uuid-max',
            username: 'Max',
            inventory: { received_friend_requests: [] }
        };

        const mockSb = {
            auth: {
                getUser: async () => ({ data: { user: { id: 'uuid-vendeez', email: 'vendeez@boblox.local' } } })
            },
            from: (table) => {
                return {
                    select: (cols) => ({
                        ilike: (col, val) => ({
                            maybeSingle: async () => ({ data: mockTargetProfile, error: null })
                        }),
                        eq: (col, val) => ({
                            maybeSingle: async () => ({ data: { id: 'uuid-vendeez', username: 'Vendeez' }, error: null })
                        })
                    }),
                    update: (payload) => ({
                        eq: (col, val) => {
                            updateCalledWith = payload;
                            return Promise.resolve({ data: null, error: null });
                        }
                    })
                };
            }
        };

        global.authState.user = { id: 'uuid-vendeez', username: 'Vendeez' };

        const resReq = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/friends/request', {
            method: 'POST',
            body: { targetUsername: 'Max', sender: { senderProfile: { username: 'Vendeez' } } }
        });

        assert.strictEqual(resReq.ok, true);
        assert.ok(updateCalledWith?.inventory?.received_friend_requests?.some(r => r.username === 'Vendeez'), 'Should write received_friend_requests to target');

        // Test accept
        mockTargetProfile.inventory.received_friend_requests = [{ username: 'Vendeez' }];
        const resAccept = await PortalStore.handleSupabaseApiRequest(mockSb, '/api/friends/accept', {
            method: 'POST',
            body: { targetUsername: 'Max' }
        });
        assert.strictEqual(resAccept.ok, true);
        assert.ok(updateCalledWith?.inventory?.friends?.includes('vendeez'), 'Target profile friends should include accepter');
    });
});

