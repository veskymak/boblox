/* Serializes commands and ignores responses belonging to a signed-out account. */
let accountCommandQueue = Promise.resolve();
let lastParticipationRequest = 0;
function isServerAccount() {
    return typeof authState !== 'undefined' && !!authState.user;
}
function accountIdentity() {
    return authState.user ? `${authState.user.id}:${authState.token}` : null;
}
async function accountCommand(command, payload = {}, requestId = crypto.randomUUID()) {
    const identity = accountIdentity();
    if (!identity) throw new Error('Pro ukládání se přihlas.');
    const run = async () => {
        if (accountIdentity() !== identity) throw new Error('Účet byl změněn.');
        const response = await apiRequest('/api/account/command', {
            method: 'POST',
            body: { command, payload, requestId }
        });
        if (!response.ok) throw new Error(response.data?.error || 'Operace nebyla potvrzena.');
        if (accountIdentity() !== identity) throw new Error('Účet byl změněn.');
        const data = response.data;
        if (data.user && Number(data.user.revision || 0) < Number(authState.user.revision || 0))
            data.user = authState.user;
        if (data.user) applyAuthenticatedUser(data.user);
        if (typeof data.wheelAt === 'number')
            localStorage.setItem(STORAGE_KEYS.WHEEL, String(data.extraSpin ? 0 : data.wheelAt));
        if (typeof gameSpecificData !== 'undefined' && activeGameMode === 'adoptme' && data.user) {
            gameSpecificData.bucks = data.user.adoptme_bucks;
            gameSpecificData.pets = data.user.adoptme_pets;
            if (typeof refreshAdoptMeHUD === 'function') refreshAdoptMeHUD();
        }
        return data;
    };
    const operation = accountCommandQueue.then(run, run);
    accountCommandQueue = operation.catch(() => {});
    return operation;
}
function reportAccountError(error) {
    if (typeof showHudToast === 'function') showHudToast(error.message || 'Operace nebyla uložena.', 'red');
}
function requestGameReward() {
    if (Date.now() - lastParticipationRequest < 30000) return;
    lastParticipationRequest = Date.now();
    accountCommand('game_reward')
        .then(() => showHudToast('+20 B$ za účast ve hře.', 'gold'))
        .catch(() => {});
}
function startAccountGame(gameId) {
    if (!isServerAccount()) return;
    lastParticipationRequest = Date.now();
    accountCommand('game_start', { gameId }).catch(reportAccountError);
}
