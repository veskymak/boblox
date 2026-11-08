/* Consent is account-scoped and confirmed by the server, never localStorage. */
let consentAccount = null;
let consentChecking = false;
let consentSaving = false;
function hasAccountConsent() {
    return typeof authState !== 'undefined' && !!authState.user && consentAccount === authState.user.id;
}
async function refreshAccountConsent() {
    const account = authState.user?.id;
    const modal = document.getElementById('account-consent-modal');
    if (!account) { consentAccount = null; if (modal.open) modal.close(); return; }
    if (hasAccountConsent() || consentChecking) return;
    if (!modal.open) {
        document.getElementById('consent-age').checked = false;
        if (document.pointerLockElement) document.exitPointerLock();
        modal.showModal();
    }
    consentChecking = true;
    try {
        const result = await apiRequest('/api/auth/consent');
        if (authState.user?.id !== account) return;
        if (result.ok && result.data.accepted) {
            consentAccount = account;
            modal.close();
            if (typeof refreshRecoveryEmailPrompt === 'function') refreshRecoveryEmailPrompt();
        } else if (!result.ok) document.getElementById('consent-status').textContent = 'Stav se nepodařilo ověřit. Zkus potvrzení znovu.';
    } catch {
        if (authState.user?.id === account) document.getElementById('consent-status').textContent = 'Připojení se nezdařilo. Zkus to znovu.';
    } finally { consentChecking = false; }
}
async function submitAccountConsent(event) {
    event.preventDefault();
    const age = document.getElementById('consent-age').checked;
    if (!age || consentSaving) return;
    const account = authState.user?.id;
    consentSaving = true;
    const button = document.getElementById('consent-submit');
    button.disabled = true;
    try {
        const result = await apiRequest('/api/auth/consent', { method: 'POST', body: { ageOver15: age } });
        if (authState.user?.id !== account) return;
        if (!result.ok || !result.data.accepted) {
            document.getElementById('consent-status').textContent = 'Potvrzení se nepodařilo uložit. Zkus to znovu.';
            return;
        }
        consentAccount = account;
        document.getElementById('account-consent-modal').close();
        if (typeof refreshRecoveryEmailPrompt === 'function') refreshRecoveryEmailPrompt();
    } catch {
        if (authState.user?.id === account) document.getElementById('consent-status').textContent = 'Připojení se nezdařilo. Zkus to znovu.';
    } finally { consentSaving = false; button.disabled = false; }
}
document.getElementById('account-consent-modal').addEventListener('cancel', event => event.preventDefault());
// Global game key handlers must not move the player behind the dialog.
for (const type of ['keydown', 'keyup']) document.addEventListener(type, event => {
    if (document.getElementById('account-consent-modal').open || document.getElementById('privacy-modal')?.open) event.stopPropagation();
}, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAccountConsent(); });
setInterval(() => { if (!document.hidden) refreshAccountConsent(); }, 15000);
