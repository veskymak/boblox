/* ============================================================================
 * BOBLOX ADMIN UI & CONTROLS MODULE (DEDICATED FOR VENDEEZ)
 * ============================================================================ */

let adminCachedUsers = [];

function isCurrentUserAdmin(user) {
    const target = user || ((typeof authState !== 'undefined' && authState) ? authState.user : null);
    if (!target || typeof target.username !== 'string') return false;
    const name = target.username.trim().toLowerCase();
    return name === 'vendeez' || Boolean(target.isAdmin);
}

function updateAdminUI() {
    const isAdmin = isCurrentUserAdmin();
    const sidebarBtn = document.getElementById('sidebar-admin-btn');
    const mobileBtn = document.getElementById('quick-action-admin');
    const adminModal = document.getElementById('admin-modal');

    if (sidebarBtn) {
        if (isAdmin) {
            sidebarBtn.classList.remove('hidden');
            sidebarBtn.classList.add('flex');
        } else {
            sidebarBtn.classList.remove('flex');
            sidebarBtn.classList.add('hidden');
        }
    }

    if (mobileBtn) {
        if (isAdmin) {
            mobileBtn.classList.remove('hidden');
            mobileBtn.classList.add('flex');
        } else {
            mobileBtn.classList.remove('flex');
            mobileBtn.classList.add('hidden');
        }
    }

    if (!isAdmin && adminModal && !adminModal.classList.contains('hidden')) {
        closeAdminModal();
    }
}

function openAdminModal() {
    if (!isCurrentUserAdmin()) {
        if (typeof showHudToast === 'function') {
            showHudToast('Přístup odepřen: Pouze pro vývojáře Vendeez!', 'red');
        }
        return;
    }
    if (document.pointerLockElement) document.exitPointerLock();
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    switchAdminTab('economy');
    if (typeof loadAdminUsersList === 'function') {
        loadAdminUsersList();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function switchAdminTab(tabName) {
    const tabs = ['economy', 'users', 'broadcast', 'cheats'];
    tabs.forEach(t => {
        const btn = document.getElementById(`admin-tab-btn-${t}`);
        const panel = document.getElementById(`admin-panel-${t}`);
        const isActive = t === tabName;
        if (btn) {
            if (isActive) {
                btn.className = 'min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold bg-amber-500 text-black shadow-lg shadow-amber-500/20 transition shrink-0 flex items-center justify-center';
            } else {
                btn.className = 'min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-[#2C2F33] transition shrink-0 flex items-center justify-center';
            }
        }
        if (panel) {
            if (isActive) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
    });
}

function toggleAdminGodmode(forceVal) {
    if (typeof playerState === 'undefined') return false;
    playerState.godmode = typeof forceVal === 'boolean' ? forceVal : !playerState.godmode;
    const indicator = document.getElementById('admin-godmode-status');
    if (indicator) {
        indicator.textContent = playerState.godmode ? 'AKTIVNÍ' : 'VYPNUTO';
        indicator.className = playerState.godmode ? 'text-green-400 font-bold' : 'text-gray-400 font-bold';
    }
    if (typeof showHudToast === 'function') {
        showHudToast(`Godmode: ${playerState.godmode ? 'ZAPNUTO (Nesmrtelnost)' : 'VYPNUTO'}`, playerState.godmode ? 'gold' : 'blue');
    }
    return playerState.godmode;
}

function toggleAdminSuperSpeed(forceVal) {
    if (typeof playerState === 'undefined') return false;
    playerState.superSpeed = typeof forceVal === 'boolean' ? forceVal : !playerState.superSpeed;
    const indicator = document.getElementById('admin-superspeed-status');
    if (indicator) {
        indicator.textContent = playerState.superSpeed ? 'AKTIVNÍ' : 'VYPNUTO';
        indicator.className = playerState.superSpeed ? 'text-green-400 font-bold' : 'text-gray-400 font-bold';
    }
    if (typeof showHudToast === 'function') {
        showHudToast(`Super Speed: ${playerState.superSpeed ? 'ZAPNUTO (2.5x rychlost)' : 'VYPNUTO'}`, playerState.superSpeed ? 'gold' : 'blue');
    }
    return playerState.superSpeed;
}

function resetAdminDailyCooldown() {
    if (typeof lastClaimTimestamp !== 'undefined') {
        lastClaimTimestamp = 0;
        const dailyTsKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.DAILY_TS) ? STORAGE_KEYS.DAILY_TS : 'boblox_daily_claim_ts_v2';
        try { localStorage.setItem(dailyTsKey, '0'); } catch (e) {}
    }
    if (typeof updateDailyBonusUI === 'function') {
        updateDailyBonusUI();
    }
    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer();
    }
    if (typeof showHudToast === 'function') {
        showHudToast('Denní bonus cooldown byl úspěšně vynulován!', 'gold');
    }
}

function getFallbackAdminUsers() {
    let localUsers = [];
    if (typeof getLocalUsersDB === 'function') {
        try {
            const rawUsers = getLocalUsersDB() || [];
            localUsers = rawUsers.map(u => ({
                id: u.id,
                username: u.username,
                coins: Number(u.coins) || 0
            }));
        } catch (err) {}
    }

    const currentUser = (typeof authState !== 'undefined' && authState && authState.user) ? authState.user : null;
    const hasAdminInList = currentUser && localUsers.some(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
    if (!hasAdminInList && currentUser && isCurrentUserAdmin(currentUser)) {
        const coins = typeof currentUser.coins === 'number'
            ? currentUser.coins
            : ((typeof bobuxBalance !== 'undefined') ? bobuxBalance : 250);
        localUsers.unshift({
            id: currentUser.id || 1,
            username: currentUser.username,
            coins: Number(coins) || 0
        });
    }

    return localUsers;
}

async function submitAdminGiveCoins(amount, action = 'add', targetUsername = null) {
    if (!isCurrentUserAdmin()) return;
    const username = targetUsername || (document.getElementById('admin-target-user-input')?.value || '').trim() || ((typeof authState !== 'undefined' && authState.user) ? authState.user.username : 'Vendeez');
    const amountVal = (typeof amount === 'number') ? amount : parseInt(document.getElementById('admin-custom-coins-input')?.value, 10);
    if (isNaN(amountVal)) return;

    try {
        let data = null;
        if (typeof apiRequest === 'function') {
            const res = await apiRequest('/api/admin/give-coins', {
                method: 'POST',
                body: { username, amount: amountVal, action }
            });
            data = res.data || {};
        }

        if (data && data.ok) {
            if (typeof showHudToast === 'function') {
                showHudToast(`Bobuxy upraveny: ${data.username} má nyní ${Number(data.coins).toLocaleString('cs-CZ')} B$!`, 'gold');
            }
            if (typeof authState !== 'undefined' && authState.user && authState.user.username.toLowerCase() === data.username.toLowerCase()) {
                if (typeof bobuxBalance !== 'undefined') {
                    bobuxBalance = data.coins;
                }
                authState.user.coins = data.coins;
                const bobuxKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.BOBUX) ? STORAGE_KEYS.BOBUX : 'boblox_bobux_balance_v1';
                try {
                    localStorage.setItem(bobuxKey, String(data.coins));
                } catch (e) {}
                if (typeof updateBobuxUI === 'function') updateBobuxUI();
            }
            if (typeof loadAdminUsersList === 'function') {
                loadAdminUsersList();
            }
        } else {
            const errMsg = (data && data.error) ? data.error : 'Chyba při úpravě Bobuxů.';
            console.warn('[AdminUI] Chyba při úpravě mincí:', errMsg);
            if (typeof showHudToast === 'function') showHudToast(errMsg, 'red');
        }
    } catch (e) {
        console.warn('[AdminUI] Chyba při úpravě mincí:', e);
        if (typeof showHudToast === 'function') showHudToast('Chyba komunikace se serverem.', 'red');
    }
}

async function submitAdminBroadcast() {
    if (!isCurrentUserAdmin()) return;
    const input = document.getElementById('admin-broadcast-input');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    try {
        let data = null;
        if (typeof apiRequest === 'function') {
            const res = await apiRequest('/api/admin/broadcast', {
                method: 'POST',
                body: { message: msg }
            });
            data = res.data || {};
        }

        if (data && data.ok) {
            if (input) input.value = '';
            if (typeof showHudToast === 'function') {
                showHudToast('Systémové oznámení odesláno všem hráčům!', 'gold');
            }
        } else {
            const errMsg = (data && data.error) ? data.error : 'Chyba při odesílání oznámení.';
            console.warn('[AdminUI] Chyba při odesílání hromadného oznámení:', errMsg);
            if (typeof showHudToast === 'function') showHudToast(errMsg, 'red');
        }
    } catch (e) {
        console.warn('[AdminUI] Chyba při odesílání hromadného oznámení:', e);
        if (typeof showHudToast === 'function') showHudToast('Chyba komunikace se serverem.', 'red');
    }
}

function renderFallbackAdminUsers(listContainer, errorMsg = 'Chyba připojení k serveru.') {
    const fallbackUsers = getFallbackAdminUsers();
    if (fallbackUsers.length > 0) {
        renderAdminUsersList(fallbackUsers);
        return true;
    }
    if (listContainer) {
        listContainer.innerHTML = `<div class="text-center text-red-400 py-6 text-xs">${errorMsg}</div>`;
    }
    return false;
}

async function loadAdminUsersList() {
    const listContainer = document.getElementById('admin-users-list');
    if (!listContainer) return;
    listContainer.innerHTML = '<div class="text-center text-gray-400 py-6 text-xs">Načítání seznamu hráčů...</div>';

    try {
        let data = null;
        if (typeof apiRequest === 'function') {
            const res = await apiRequest('/api/admin/users');
            if (res && res.data) {
                data = res.data;
            }
        }

        if (!data || !data.ok || !Array.isArray(data.users)) {
            console.warn('[AdminUI] Chyba při načítání seznamu administrátorských uživatelů:', (data && data.error) || 'Neplatná data ze serveru.');
            renderFallbackAdminUsers(listContainer, 'Chyba při načítání uživatelů.');
            return;
        }

        renderAdminUsersList(data.users);
    } catch (e) {
        console.warn('[AdminUI] Chyba při načítání seznamu administrátorských uživatelů:', e);
        renderFallbackAdminUsers(listContainer, 'Chyba připojení k serveru.');
    }
}

function renderAdminUsersList(users) {
    adminCachedUsers = users || adminCachedUsers || [];
    const listContainer = document.getElementById('admin-users-list');
    if (!listContainer) return;

    const query = (document.getElementById('admin-users-search')?.value || '').trim().toLowerCase();
    const filtered = adminCachedUsers.filter(u => !query || (u.username && u.username.toLowerCase().includes(query)));

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-6 text-xs">Žádní hráči nenalezeni.</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(u => {
        const isMe = typeof authState !== 'undefined' && authState.user && authState.user.username && authState.user.username.toLowerCase() === u.username.toLowerCase();
        return `
            <div class="flex items-center justify-between p-3 rounded-xl bg-[#191B1D] border border-[#2C2F33] hover:border-amber-500/30 transition">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                        ${(u.username || 'P')[0].toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-xs text-white truncate">${u.username}</span>
                            ${isMe ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">TY</span>' : ''}
                        </div>
                        <div class="text-[11px] text-[#FFE066] font-semibold">${Number(u.coins || 0).toLocaleString('cs-CZ')} B$</div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" onclick="submitAdminGiveCoins(1000, 'add', '${u.username}')" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-[#2C2F33] hover:bg-amber-500 hover:text-black text-gray-300 transition flex items-center justify-center">+1k</button>
                    <button type="button" onclick="submitAdminGiveCoins(10000, 'add', '${u.username}')" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-[#2C2F33] hover:bg-amber-500 hover:text-black text-gray-300 transition flex items-center justify-center">+10k</button>
                    <button type="button" onclick="promptAdminSetCoins('${u.username}')" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition flex items-center justify-center">Nastavit</button>
                </div>
            </div>
        `;
    }).join('');
}

function promptAdminSetCoins(targetUsername) {
    const raw = prompt(`Zadej nový počet Bobuxů pro hráče ${targetUsername}:`, '10000');
    if (raw === null) return;
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
        submitAdminGiveCoins(num, 'set', targetUsername);
    }
}

if (typeof window !== 'undefined') {
    window.isCurrentUserAdmin = isCurrentUserAdmin;
    window.updateAdminUI = updateAdminUI;
    window.openAdminModal = openAdminModal;
    window.closeAdminModal = closeAdminModal;
    window.switchAdminTab = switchAdminTab;
    window.toggleAdminGodmode = toggleAdminGodmode;
    window.toggleAdminSuperSpeed = toggleAdminSuperSpeed;
    window.resetAdminDailyCooldown = resetAdminDailyCooldown;
    window.getFallbackAdminUsers = getFallbackAdminUsers;
    window.renderFallbackAdminUsers = renderFallbackAdminUsers;
    window.loadAdminUsersList = loadAdminUsersList;
    window.renderAdminUsersList = renderAdminUsersList;
    window.submitAdminGiveCoins = submitAdminGiveCoins;
    window.submitAdminBroadcast = submitAdminBroadcast;
    window.promptAdminSetCoins = promptAdminSetCoins;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isCurrentUserAdmin,
        updateAdminUI,
        openAdminModal,
        closeAdminModal,
        switchAdminTab,
        toggleAdminGodmode,
        toggleAdminSuperSpeed,
        resetAdminDailyCooldown,
        getFallbackAdminUsers,
        renderFallbackAdminUsers,
        loadAdminUsersList,
        renderAdminUsersList,
        submitAdminGiveCoins,
        submitAdminBroadcast,
        promptAdminSetCoins
    };
}
