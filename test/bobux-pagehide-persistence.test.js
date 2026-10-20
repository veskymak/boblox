const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createWalletSyncHarness() {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'state', 'PortalStore.js'), 'utf8');
    const syncStart = source.indexOf('let accountSyncQueue = null;');
    const syncEnd = source.indexOf('\nfunction formatDateTimeUserFriendly', syncStart);
    const walletStart = source.indexOf('function recordBobuxTransaction');
    const walletEnd = source.indexOf('\nfunction updateBobuxUI', walletStart);
    assert.notEqual(syncStart, -1);
    assert.notEqual(syncEnd, -1);
    assert.notEqual(walletStart, -1);
    assert.notEqual(walletEnd, -1);

    const backend = { coins: 500 };
    const requests = [];
    const pagehideHandlers = [];
    const storage = new Map();
    const context = {
        STORAGE_KEY_BOBUX: 'boblox_bobux_balance_v1',
        STORAGE_KEY_TRANSACTIONS: 'boblox_bobux_transactions_v2',
        lastClaimTimestamp: 0,
        supabaseKeepalive: false,
        authState: { user: { id: 'test-player', username: 'BobuxTest' }, token: 'test-token' },
        bobuxBalance: backend.coins,
        bobuxTransactions: [],
        ownedShopItems: new Set(['face_classic']),
        avatarOutfit: { shirt: null, pants: null, face: 'face_classic', hat: null },
        avatarTorsoHex: '#0D69AC',
        gamesPlayedCount: 0,
        friendsSet: new Set(),
        sentFriendRequests: {},
        receivedFriendRequests: {},
        window: {
            addEventListener(event, handler) {
                if (event === 'pagehide') pagehideHandlers.push(handler);
            }
        },
        localStorage: {
            getItem(key) {
                return storage.get(key) ?? null;
            },
            setItem(key, value) {
                storage.set(key, String(value));
            }
        },
        loadAdoptMeSavedData: () => null,
        updateBobuxUI() {},
        sfx: { playCoin() {} },
        showHudToast() {},
        apiRequest(_url, options) {
            let resolve;
            const promise = new Promise((done) => {
                resolve = done;
            });
            requests.push({
                body: options.body,
                keepalive: options.keepalive === true,
                persist() {
                    backend.coins = options.body.coins;
                    resolve({ user: {} });
                }
            });
            return promise;
        }
    };

    vm.runInNewContext(
        source.slice(syncStart, syncEnd)
            + source.slice(walletStart, walletEnd)
            + '\nglobalThis.wallet = { spendBobux, addBobux };',
        context
    );

    return {
        backend,
        requests,
        wallet: context.wallet,
        pagehide() {
            pagehideHandlers.forEach((handler) => handler());
        }
    };
}

describe('Bobux persistence when refreshing after a casino win', () => {
    it('keeps the winnings when the page is refreshed during the balance sync', () => {
        const { backend, requests, wallet, pagehide } = createWalletSyncHarness();

        wallet.addBobux(100, 'Test casino win');
        assert.equal(requests.length, 1);

        pagehide();
        const pagehideSync = requests.find((request) => request.keepalive);
        assert.ok(pagehideSync, 'pagehide should send the latest balance with keepalive');
        pagehideSync.persist();

        const balanceAfterReload = backend.coins;
        assert.equal(balanceAfterReload, 600);
    });

    it('keeps the winnings when their sync is queued behind the bet sync', () => {
        const { backend, requests, wallet, pagehide } = createWalletSyncHarness();

        wallet.spendBobux(100, 'Test casino bet');
        wallet.addBobux(200, 'Test casino win');
        assert.equal(requests.length, 1);

        pagehide();
        const pagehideSync = requests.find((request) => request.keepalive);
        assert.ok(pagehideSync, 'pagehide should bypass queued syncs');
        assert.equal(pagehideSync.body.coins, 600);
        pagehideSync.persist();

        const balanceAfterReload = backend.coins;
        assert.equal(balanceAfterReload, 600);
    });
});
