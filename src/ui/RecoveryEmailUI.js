/* Account-scoped, server-persisted one-time email invitation. */
let recoveryEmailAccount = null;
let recoveryEmailChecking = false;
let recoveryEmailBusy = false;
let recoveryEmailPreviousFocus = null;

function closeRecoveryEmailPrompt() {
    const modal = document.getElementById('recovery-email-modal');
    if (modal?.open) modal.close();
    recoveryEmailAccount = null;
}

async function refreshRecoveryEmailPrompt(force = false) {
    if (typeof hasAccountConsent === 'function' && !hasAccountConsent()) return;
    const account = authState.user?.id;
    if (!account || recoveryEmailChecking || (!force && recoveryEmailAccount === account)) return;
    recoveryEmailChecking = true;
    try {
        const response = await apiRequest('/api/auth/email-status');
        if (authState.user?.id !== account || !response.ok) return;
        recoveryEmailAccount = account;
        const modal = document.getElementById('recovery-email-modal');
        if (!modal) return;
        if (!response.data.showPrompt) { if (modal.open) modal.close(); return; }
        if (modal.open) return;
        recoveryEmailPreviousFocus = document.activeElement;
        document.getElementById('recovery-email-form').classList.remove('editing');
        document.getElementById('recovery-email-input').value = '';
        document.getElementById('recovery-email-input').disabled = true;
        document.getElementById('recovery-email-action').setAttribute('aria-label', 'Přidat e-mail');
        document.getElementById('recovery-email-action').hidden = false;
        document.getElementById('recovery-email-status').textContent = '';
        document.getElementById('recovery-email-later').textContent = 'Ne, děkuji';
        if (document.pointerLockElement) document.exitPointerLock();
        modal.showModal();
    } finally { recoveryEmailChecking = false; }
}

async function submitRecoveryEmail(event) {
    event.preventDefault();
    if (recoveryEmailBusy) return;
    const form = document.getElementById('recovery-email-form');
    const input = document.getElementById('recovery-email-input');
    const action = document.getElementById('recovery-email-action');
    if (!form.classList.contains('editing')) {
        input.disabled = false;
        form.classList.add('editing');
        action.setAttribute('aria-label', 'Potvrdit e-mail a odeslat ověřovací zprávu');
        input.focus({ preventScroll: true });
        return;
    }
    if (!input.reportValidity()) return;
    const account = authState.user?.id;
    recoveryEmailBusy = true;
    action.disabled = true;
    document.getElementById('recovery-email-later').disabled = true;
    const status = document.getElementById('recovery-email-status');
    status.textContent = 'Odesílám potvrzovací e-mail…';
    try {
        const response = await apiRequest('/api/auth/email', { method: 'POST', body: {
            email: input.value.trim(), redirectTo: window.location.origin + window.location.pathname
        } });
        if (authState.user?.id !== account) return;
        if (!response.ok) { status.textContent = response.data?.error || 'Odeslání se nezdařilo. Zkus to znovu.'; return; }
        status.textContent = 'Potvrzovací zpráva byla odeslána. Otevři odkaz v e-mailu a potvrď adresu.';
        input.disabled = true;
        action.hidden = true;
        document.getElementById('recovery-email-later').textContent = 'Hotovo';
    } catch {
        status.textContent = 'Připojení se nezdařilo. Zkus to znovu.';
    } finally {
        recoveryEmailBusy = false;
        action.disabled = false;
        document.getElementById('recovery-email-later').disabled = false;
    }
}

async function dismissRecoveryEmail() {
    if (recoveryEmailBusy) return;
    recoveryEmailBusy = true;
    const account = authState.user?.id;
    try {
        const response = await apiRequest('/api/auth/email-dismiss', { method: 'POST' });
        if (authState.user?.id !== account) return;
        if (!response.ok) { document.getElementById('recovery-email-status').textContent = 'Volbu se nepodařilo uložit. Zkus to znovu.'; return; }
        document.getElementById('recovery-email-modal').close();
        recoveryEmailPreviousFocus?.focus?.();
    } finally { recoveryEmailBusy = false; }
}

async function requestPasswordReset() {
    const input = document.getElementById('auth-email-input');
    document.getElementById('auth-email-field').classList.remove('hidden');
    input.disabled = false;
    input.required = true;
    if (!input.reportValidity()) { input.focus(); return; }
    const response = await apiRequest('/api/auth/reset-password', { method: 'POST', body: {
        email: input.value.trim(), redirectTo: window.location.origin + window.location.pathname
    } });
    showAuthAlert(response.ok ? 'Pokud je k adrese přiřazený účet, přijde odkaz pro obnovu hesla.' : response.data?.error || 'Odeslání se nezdařilo.', !response.ok);
}

async function saveRecoveredPassword(event) {
    event.preventDefault();
    const input = document.getElementById('recovery-password-input');
    if (!input.reportValidity()) return;
    const button = document.getElementById('recovery-password-submit');
    button.disabled = true;
    try {
        const response = await apiRequest('/api/auth/password', { method: 'POST', body: { password: input.value } });
        document.getElementById('recovery-password-status').textContent = response.ok ? 'Heslo bylo změněno.' : response.data?.error || 'Heslo se nepodařilo změnit.';
        if (response.ok) { input.value = ''; document.getElementById('recovery-password-modal').close(); openAuthModal(); }
    } finally { button.disabled = false; }
}

document.getElementById('recovery-email-modal')?.addEventListener('cancel', event => {
    event.preventDefault();
    dismissRecoveryEmail();
});
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshRecoveryEmailPrompt(true);
});
const recoveryAuthClient = getSupabaseClient();
recoveryAuthClient?.auth.onAuthStateChange(event => {
    // Do not await Auth calls inside this callback (SDK session lock).
    if (event === 'PASSWORD_RECOVERY') setTimeout(() => document.getElementById('recovery-password-modal')?.showModal(), 0);
});
