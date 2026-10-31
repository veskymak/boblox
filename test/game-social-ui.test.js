const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/ui/PortalUI.js'), 'utf8');

function setup() {
    let resolve;
    const response = new Promise(done => { resolve = done; });
    let renders = 0;
    const context = vm.createContext({
        selectedGameId: 'obby', authState: { user: { username: 'Alice' }, lastCommentTime: 0 },
        COMMENT_COOLDOWN_MS: 30000,
        liveSocialState: { ratingsByGame: {}, commentsByGame: {} },
        apiRequest: () => response,
        document: { getElementById: () => ({ value: 'Comment' }) },
        sanitizeTextClient: value => value,
        showCommentStatus() {}, openAuthModal() {}, updateCommentCharCounter() {},
        sfx: { playCoin() {} },
        updateModalRatingUI() { renders++; }, renderSafeCommentsList() { renders++; }, renderGameCatalog() {}
    });
    for (const [start, end] of [
        ['async function loadGameSocialDetails(', '// Refresh from persistent storage'],
        ['async function rateSelectedGame(', 'function updateCommentCharCounter('],
        ['async function submitGameComment(', 'function closeGameModal(']
    ]) vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))), context);
    return { context, resolve, renders: () => renders };
}

test('a delayed detail response cannot overwrite the newly selected game', async () => {
    const harness = setup();
    const pending = vm.runInContext("loadGameSocialDetails('obby')", harness.context);
    harness.context.selectedGameId = 'sfoth';
    harness.resolve({ ok: true, data: { likes: 1, comments: [{ id: 1 }] } });
    await pending;
    assert.equal(harness.context.liveSocialState.ratingsByGame.obby.likes, 1);
    assert.equal(harness.renders(), 0);
});

test('delayed comment and vote responses stay attached to the original game', async () => {
    for (const call of ['submitGameComment()', "rateSelectedGame('like')"]) {
        const harness = setup();
        const pending = vm.runInContext(call, harness.context);
        harness.context.selectedGameId = 'sfoth';
        harness.resolve({ ok: true, data: { likes: 1, myVote: 'like', comment: { id: 1, content: 'Comment' } } });
        await pending;
        const state = harness.context.liveSocialState;
        assert.equal(state.commentsByGame.sfoth, undefined);
        assert.equal(state.ratingsByGame.sfoth, undefined);
        assert.ok(state.commentsByGame.obby || state.ratingsByGame.obby);
        assert.equal(harness.renders(), 0);
    }
});
