/* No background analytics; all account reads use the central API transport. */
let privacyExportBusy = false;
function openPrivacyCenter() {
    const modal = document.getElementById('privacy-modal');
    const account = authState.user;
    document.getElementById('privacy-export').disabled = !account;
    document.getElementById('privacy-status').textContent = account ? '' : 'Pro export údajů se přihlas. Žádost můžeš poslat také e-mailem.';
    const requests = {
        access: 'Žádost o přístup k osobním údajům',
        erasure: 'Žádost o výmaz účtu a osobních údajů',
        correction: 'Žádost o opravu osobních údajů',
        objection: 'Námitka proti zpracování osobních údajů',
        restriction: 'Žádost o omezení zpracování osobních údajů'
    };
    for (const [key, subject] of Object.entries(requests)) {
        const body = `${subject}\n\nUživatelské jméno: ${account?.username || ''}\nID účtu: ${account?.id || ''}\n\nUpřesnění žádosti:\n`;
        document.getElementById('privacy-' + key).href = 'mailto:venda.pekny@gmail.com?subject=' + encodeURIComponent('Boblox – ' + subject) + '&body=' + encodeURIComponent(body);
    }
    if (document.pointerLockElement) document.exitPointerLock();
    if (!modal.open) modal.showModal();
}
async function exportPrivacyData() {
    const account = authState.user?.id;
    if (!account || privacyExportBusy) return;
    privacyExportBusy = true;
    const button = document.getElementById('privacy-export');
    const status = document.getElementById('privacy-status');
    button.disabled = true;
    status.textContent = 'Připravuji export…';
    try {
        const result = await apiRequest('/api/auth/privacy-export');
        if (authState.user?.id !== account) return;
        if (!result.ok) { status.textContent = 'Export se nepodařilo získat. Zkus to znovu nebo napiš na kontaktní e-mail.'; return; }
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'boblox-osobni-udaje.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Export byl připraven ke stažení. Obsahuje soukromé údaje; nesdílej ho veřejně. Technické logy a další údaje vyžádej e-mailem.';
    } catch {
        if (authState.user?.id === account) status.textContent = 'Připojení se nezdařilo. Zkus to znovu.';
    } finally {
        privacyExportBusy = false;
        button.disabled = !authState.user;
    }
}
