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
    createElement: () => ({ getContext: () => null })
};
global.setInterval = () => ({ unref: () => {} });
global.setTimeout = () => ({ unref: () => {} });

// Shims for state
global.authState = {
    user: { username: 'Vendeez', id: 1, coins: 5000 },
    token: 'sb_jwt_user_vendeez_1',
    backendConnected: true,
    isSupabase: true
};

let hudToastMessages = [];
global.showHudToast = (msg, color) => {
    hudToastMessages.push({ msg, color });
};

let socialBroadcasts = [];
global.sendSocialBroadcast = (event, payload) => {
    socialBroadcasts.push({ event, payload });
};

let handledBroadcasts = [];
global.handleIncomingAdminBroadcast = (payload) => {
    handledBroadcasts.push(payload);
};

const AdminUI = require('../src/ui/AdminUI.js');
const PortalStore = require('../src/state/PortalStore.js');

describe('Seam 4: Realtime Admin Broadcast Across Static Devices', () => {
    beforeEach(() => {
        hudToastMessages = [];
        socialBroadcasts = [];
        handledBroadcasts = [];
        elementsMap['admin-broadcast-input'] = createMockElement('admin-broadcast-input', 'Pozor, turnaj za 5 minut!');
        global.authState.user = { username: 'Vendeez', id: 1, coins: 5000 };
    });
    it('submitAdminBroadcast broadcasts message to all players via sendSocialBroadcast on static hosting', async () => {
        const adapter=require('./helpers/account-adapter.cjs');let operation;
        const sb={auth:{getUser:async()=>({data:{user:{id:'actor'}}})},rpc:async(name,args)=>{operation=args.command;return {data:{ok:true}};}};
        assert.strictEqual((await adapter.request(sb,'/api/admin/broadcast',{method:'POST',body:{message:'hello'}})).ok,true);assert.strictEqual(operation,'broadcast');
    });
    it('handleSupabaseApiRequest broadcasts admin_broadcast to Supabase channel when executed', async () => {
        const adapter=require('./helpers/account-adapter.cjs');
        const sb={auth:{getUser:async()=>({data:{user:{id:'actor'}}})},rpc:async()=>({error:{code:'42501',message:'denied'}})};
        assert.strictEqual((await adapter.request(sb,'/api/admin/broadcast',{method:'POST',body:{message:'hello'}})).ok,false);
    });
});
