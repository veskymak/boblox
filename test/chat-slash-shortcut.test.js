const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Chat Slash Shortcut Repro and Verification', () => {
    let keydownHandler = null;
    let chatBox;
    let chatInput;
    let focusedElement = null;

    beforeEach(() => {
        focusedElement = null;

        const classList = new Set(['hidden', 'flex-col']);
        chatBox = {
            id: 'roblox-chat-box',
            classList: {
                contains: (cls) => classList.has(cls),
                add: (cls) => classList.add(cls),
                remove: (cls) => classList.delete(cls),
                toggle: (cls, force) => {
                    if (force === undefined) {
                        if (classList.has(cls)) classList.delete(cls);
                        else classList.add(cls);
                    } else if (force) {
                        classList.add(cls);
                    } else {
                        classList.delete(cls);
                    }
                }
            }
        };

        chatInput = {
            id: 'roblox-chat-input',
            value: '',
            focus: () => { focusedElement = chatInput; },
            blur: () => { if (focusedElement === chatInput) focusedElement = null; }
        };

        const canvasEl = {
            addEventListener: () => {},
            removeEventListener: () => {},
            focus: () => {}
        };

        global.document = {
            readyState: 'loading',
            activeElement: null,
            getElementById: (id) => {
                if (id === 'three-canvas') return canvasEl;
                if (id === 'roblox-chat-box') return chatBox;
                if (id === 'roblox-chat-input') return chatInput;
                return null;
            },
            addEventListener: () => {},
            removeEventListener: () => {}
        };

        global.window = {
            addEventListener: (event, handler) => {
                if (event === 'keydown') keydownHandler = handler;
            },
            removeEventListener: () => {}
        };

        global.navigator = { maxTouchPoints: 0 };
        global.updateNickname = () => {};
        global.mpState = { nick: 'Player' };
        global.STORAGE_KEY_NICK = 'nick';
        global.localStorage = { getItem: () => null, setItem: () => {} };
        global.activeGameMode = 'obby';
        global.keysPressed = {};
        global.touchState = {};
        global.camState = { distance: 10 };
        global.playerState = { weaponLoadout: [] };
        global.robloxUiState = {
            isMenuOpen: false,
            isChatOpen: false,
            shiftLockEnabled: true,
            isShiftLocked: false,
            isPerfStatsOpen: false
        };

        // Load toggleRobloxChat from PortalUI.js
        const portalUiCode = fs.readFileSync(path.join(__dirname, '../src/ui/PortalUI.js'), 'utf8');
        const fnMatch = portalUiCode.match(/function toggleRobloxChat[\s\S]*?\n\}/);
        if (fnMatch) {
            eval(`global.toggleRobloxChat = ${fnMatch[0]}`);
        }

        // Load InputManager.js keydown listener
        const inputMgrCode = fs.readFileSync(path.join(__dirname, '../src/core/InputManager.js'), 'utf8');
        eval(inputMgrCode);
    });

    function dispatchKeydown(eventProps) {
        let defaultPrevented = false;
        const event = {
            preventDefault: () => { defaultPrevented = true; },
            stopPropagation: () => {},
            repeat: false,
            ...eventProps
        };
        keydownHandler(event);
        return { defaultPrevented };
    }

    it('opens chat when pressing US slash key (code=Slash, key=/)', (t, done) => {
        assert.strictEqual(global.robloxUiState.isChatOpen, false);
        assert.strictEqual(chatBox.classList.contains('hidden'), true);

        dispatchKeydown({ code: 'Slash', key: '/' });

        assert.strictEqual(global.robloxUiState.isChatOpen, true);
        assert.strictEqual(chatBox.classList.contains('hidden'), false);
        setTimeout(() => {
            assert.strictEqual(focusedElement, chatInput);
            done();
        }, 30);
    });

    it('opens chat when pressing Czech keyboard slash (Shift + ú: key=/, code=BracketLeft)', (t, done) => {
        assert.strictEqual(global.robloxUiState.isChatOpen, false);
        assert.strictEqual(chatBox.classList.contains('hidden'), true);

        // On Czech QWERTZ/QWERTY, slash is Shift + Ú (code BracketLeft)
        dispatchKeydown({ code: 'BracketLeft', key: '/', shiftKey: true });

        assert.strictEqual(global.robloxUiState.isChatOpen, true, 'Chat should open when key="/" on Czech layout');
        assert.strictEqual(chatBox.classList.contains('hidden'), false);
        setTimeout(() => {
            assert.strictEqual(focusedElement, chatInput);
            done();
        }, 30);
    });

    it('opens chat when pressing Numpad slash (key=/, code=NumpadDivide)', (t, done) => {
        assert.strictEqual(global.robloxUiState.isChatOpen, false);
        assert.strictEqual(chatBox.classList.contains('hidden'), true);

        // On Numpad, slash is code NumpadDivide
        dispatchKeydown({ code: 'NumpadDivide', key: '/' });

        assert.strictEqual(global.robloxUiState.isChatOpen, true, 'Chat should open when numpad divide / is pressed');
        assert.strictEqual(chatBox.classList.contains('hidden'), false);
        setTimeout(() => {
            assert.strictEqual(focusedElement, chatInput);
            done();
        }, 30);
    });

    it('focuses input when chat is already open', (t, done) => {
        global.robloxUiState.isChatOpen = true;
        chatBox.classList.remove('hidden');
        chatBox.classList.add('flex');
        focusedElement = null;

        dispatchKeydown({ code: 'Slash', key: '/' });

        assert.strictEqual(global.robloxUiState.isChatOpen, true);
        assert.strictEqual(focusedElement, chatInput);
        done();
    });

    it('re-opens and focuses chat if DOM was hidden but state was out of sync', (t, done) => {
        global.robloxUiState.isChatOpen = true;
        chatBox.classList.add('hidden');
        chatBox.classList.remove('flex');
        focusedElement = null;

        dispatchKeydown({ code: 'BracketLeft', key: '/', shiftKey: true });

        assert.strictEqual(global.robloxUiState.isChatOpen, true);
        assert.strictEqual(chatBox.classList.contains('hidden'), false);
        setTimeout(() => {
            assert.strictEqual(focusedElement, chatInput);
            done();
        }, 30);
    });
});
