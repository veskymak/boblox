/* ============================================================================
 * BOBLOX ADMIN UI & CONTROLS MODULE (DEDICATED FOR VENDEEZ)
 * ============================================================================ */

let adminCachedUsers = [];
let adminEconomyPending = false;
let adminBroadcastPending = false;
let adminUsersRequest = 0;
let adminDailyPending = false;

function setAdminFeedback(message, isError = false) {
    const el = document.getElementById('admin-feedback');
    if (!el) return;
    el.textContent = message;
    el.className = `text-xs min-h-[20px] ${isError ? 'text-[#FF4D4D]' : 'text-gray-300'}`;
}

function syncAdminCheatControls() {
    const allowed = isCurrentUserAdmin();
    for (const [name, key] of [['godmode', 'godmode'], ['superspeed', 'superSpeed']]) {
        const enabled = allowed && typeof playerState !== 'undefined' && !!playerState[key];
        for (const prefix of ['admin', 'esc-admin']) {
            const status = document.getElementById(`${prefix}-${name}-status`);
            const button = document.getElementById(`${prefix}-${name}-toggle`);
            if (status) {
                status.textContent = enabled ? 'ZAPNUTO' : 'VYPNUTO';
                status.className = enabled ? 'text-[#00B06F] font-bold' : 'text-gray-400 font-bold';
            }
            if (button) {
                button.disabled = !allowed;
                button.textContent = enabled ? 'Vypnout' : 'Zapnout';
                button.setAttribute?.('aria-pressed', String(enabled));
            }
        }
    }
}

function isCurrentUserAdmin(user) {
    const target = user || ((typeof authState !== 'undefined' && authState) ? authState.user : null);
    if (!target || typeof target.username !== 'string') return false;
    const name = target.username.trim().toLowerCase();
    return name === 'vendeez';
}

function updateAdminUI() {
    const isAdmin = isCurrentUserAdmin();
    if (!isAdmin && typeof playerState !== 'undefined') {
        playerState.godmode = false;
        playerState.superSpeed = false;
    }
    for (const id of ['rblx-admin-tab', 'rblx-panel-admin']) {
        const el = document.getElementById(id);
        if (el && !isAdmin) el.classList.add('hidden');
        if (el && isAdmin && id === 'rblx-admin-tab') el.classList.remove('hidden');
    }
    if (!isAdmin) {
        adminSocialRequest++;
        const socialList = document.getElementById('admin-ratings-list');
        if (socialList) socialList.textContent = '';
        adminUsersRequest++;
        adminCachedUsers = [];
        const list = document.getElementById('admin-users-list');
        if (list) list.innerHTML = '';
    }
    syncAdminCheatControls();
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
    setAdminFeedback('Vyber akci v jednotlivých záložkách.');
    switchAdminTab('economy');
    syncAdminCheatControls();
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function switchAdminTab(tabName) {
    const tabs = ['economy', 'users', 'broadcast', 'cheats', 'ratings'];
    if (!tabs.includes(tabName)) tabName = 'economy';
    tabs.forEach(t => {
        const btn = document.getElementById(`admin-tab-btn-${t}`);
        const panel = document.getElementById(`admin-panel-${t}`);
        const isActive = t === tabName;
        if (btn) {
            btn.setAttribute?.('aria-selected', String(isActive));
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
    if (tabName === 'users' && isCurrentUserAdmin()) loadAdminUsersList();
    if (tabName === 'ratings') openAdminRatings();
    if (tabName === 'cheats') syncAdminCheatControls();
}

function toggleAdminGodmode(forceVal) {
    if (!isCurrentUserAdmin() || typeof playerState === 'undefined') return false;
    playerState.godmode = typeof forceVal === 'boolean' ? forceVal : !playerState.godmode;
    if (typeof showHudToast === 'function') {
        showHudToast(`Godmode: ${playerState.godmode ? 'ZAPNUTO (Nesmrtelnost)' : 'VYPNUTO'}`, playerState.godmode ? 'gold' : 'blue');
    }
    syncAdminCheatControls();
    return playerState.godmode;
}

function toggleAdminSuperSpeed(forceVal) {
    if (!isCurrentUserAdmin() || typeof playerState === 'undefined') return false;
    playerState.superSpeed = typeof forceVal === 'boolean' ? forceVal : !playerState.superSpeed;
    if (typeof showHudToast === 'function') {
        showHudToast(`Super Speed: ${playerState.superSpeed ? 'ZAPNUTO (2.5x rychlost)' : 'VYPNUTO'}`, playerState.superSpeed ? 'gold' : 'blue');
    }
    syncAdminCheatControls();
    return playerState.superSpeed;
}

async function resetAdminDailyCooldown() {
    if (!isCurrentUserAdmin() || adminDailyPending) return;
    adminDailyPending = true;
    const user = authState.user;
    try {
        const res = await apiRequest('/api/admin/reset-daily', { method: 'POST', body: { username: user.username } });
        if (!res?.data?.ok) throw new Error(res?.data?.error || 'Reset bonusu se nezdařil.');
        if (authState.user !== user || !isCurrentUserAdmin()) return;
        if (typeof lastClaimTimestamp !== 'undefined') {
            lastClaimTimestamp = 0;
            if (typeof STORAGE_KEYS !== 'undefined') {
                try { localStorage.setItem(STORAGE_KEYS.DAILY_TS, '0'); } catch (e) {}
            }
        }
        if (typeof updateDailyBonusUI === 'function') {
            updateDailyBonusUI();
        }
        if (authState.user) authState.user.daily_claim_date = 0;
        if (typeof showHudToast === 'function') {
            showHudToast('Denní bonus cooldown byl úspěšně vynulován!', 'gold');
        }
        setAdminFeedback('Denní bonus je znovu dostupný.');
    } catch (err) {
        setAdminFeedback(err.message, true);
        if (typeof showHudToast === 'function') showHudToast(err.message, 'red');
    } finally {
        adminDailyPending = false;
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

    let cloudUsers = [];
    if (typeof getCloudUsersCache === 'function') {
        try {
            cloudUsers = getCloudUsersCache() || [];
        } catch (err) {}
    } else {
        const cloudKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.CLOUD_USERS) ? STORAGE_KEYS.CLOUD_USERS : 'boblox_cloud_users_cache_v2';
        try {
            const raw = JSON.parse(localStorage.getItem(cloudKey) || '[]');
            if (Array.isArray(raw)) cloudUsers = raw;
        } catch (err) {}
    }

    for (const cu of cloudUsers) {
        if (!cu || !cu.username) continue;
        if (!localUsers.some(u => u.username && u.username.toLowerCase() === cu.username.toLowerCase())) {
            localUsers.push({
                id: cu.id || (localUsers.length + 1),
                username: cu.username,
                coins: Number(cu.coins) || 0
            });
        }
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
    if (!isCurrentUserAdmin() || adminEconomyPending) return;
    const username = targetUsername || (document.getElementById('admin-target-user-input')?.value || '').trim() || ((typeof authState !== 'undefined' && authState.user) ? authState.user.username : 'Vendeez');
    const raw = amount === undefined ? document.getElementById('admin-custom-coins-input')?.value : amount;
    const amountVal = Number(raw);
    if (raw === undefined || String(raw).trim() === '' || !Number.isSafeInteger(amountVal) || amountVal < 0 || !['add', 'set'].includes(action)) {
        setAdminFeedback('Zadej celé nezáporné číslo Bobuxů.', true);
        if (typeof showHudToast === 'function') {
            showHudToast('Zadej platný počet Bobuxů!', 'red');
        }
        return;
    }

    adminEconomyPending = true;
    setAdminFeedback('Ukládání zůstatku…');
    document.querySelectorAll('[data-admin-economy]').forEach(btn => { btn.disabled = true; });
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
            setAdminFeedback(`${data.username}: ${Number(data.coins).toLocaleString('cs-CZ')} B$`);
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
                const userCacheKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.USER_CACHE) ? STORAGE_KEYS.USER_CACHE : 'boblox_auth_user_cache';
                try {
                    localStorage.setItem(userCacheKey, JSON.stringify(authState.user));
                } catch (e) {}
                if (typeof updateBobuxUI === 'function') updateBobuxUI();
            }
            if (typeof loadAdminUsersList === 'function') {
                loadAdminUsersList();
            }
        } else {
            const errMsg = (data && data.error) ? data.error : 'Chyba při úpravě Bobuxů.';
            setAdminFeedback(errMsg, true);
            console.warn('[AdminUI] Chyba při úpravě mincí:', errMsg);
            if (typeof showHudToast === 'function') showHudToast(errMsg, 'red');
        }
    } catch (e) {
        console.warn('[AdminUI] Chyba při úpravě mincí:', e);
        if (typeof showHudToast === 'function') showHudToast('Chyba komunikace se serverem.', 'red');
        setAdminFeedback('Chyba komunikace se serverem.', true);
    } finally {
        adminEconomyPending = false;
        document.querySelectorAll('[data-admin-economy]').forEach(btn => { btn.disabled = false; });
    }
}

async function submitAdminBroadcast() {
    if (!isCurrentUserAdmin() || adminBroadcastPending) return;
    const input = document.getElementById('admin-broadcast-input');
    const msg = (input ? input.value : '').trim();
    if (!msg || msg.length > 300) {
        setAdminFeedback('Oznámení musí obsahovat 1 až 300 znaků.', true);
        return;
    }
    adminBroadcastPending = true;
    const button = document.getElementById('admin-broadcast-send-btn');
    if (button) button.disabled = true;
    setAdminFeedback('Odesílání oznámení…');

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
            if (input && input.value.trim() === msg) input.value = '';
            setAdminFeedback('Oznámení bylo odesláno.');
            if (typeof showHudToast === 'function') {
                showHudToast('Systémové oznámení odesláno všem hráčům!', 'gold');
            }
        } else {
            const errMsg = (data && data.error) ? data.error : 'Chyba při odesílání oznámení.';
            setAdminFeedback(errMsg, true);
            console.warn('[AdminUI] Chyba při odesílání hromadného oznámení:', errMsg);
            if (typeof showHudToast === 'function') showHudToast(errMsg, 'red');
        }
    } catch (e) {
        console.warn('[AdminUI] Chyba při odesílání hromadného oznámení:', e);
        if (typeof showHudToast === 'function') showHudToast('Chyba komunikace se serverem.', 'red');
        setAdminFeedback('Chyba komunikace se serverem.', true);
    } finally {
        adminBroadcastPending = false;
        if (button) button.disabled = false;
    }
}

function renderFallbackAdminUsers(listContainer, errorMsg = 'Chyba připojení k serveru.') {
    const fallbackUsers = getFallbackAdminUsers();
    if (fallbackUsers.length > 0) {
        renderAdminUsersList(fallbackUsers);
        setAdminFeedback('Připojení selhalo. Zobrazená mezipaměť nemusí být aktuální.', true);
        return true;
    }
    if (listContainer) {
        listContainer.innerHTML = `<div class="text-center text-red-400 py-6 text-xs">${errorMsg}</div>`;
    }
    return false;
}

async function loadAdminUsersList() {
    if (!isCurrentUserAdmin()) return;
    const request = ++adminUsersRequest;
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

        if (request !== adminUsersRequest || !isCurrentUserAdmin()) return;
        if (!data || !data.ok || !Array.isArray(data.users)) {
            console.warn('[AdminUI] Chyba při načítání seznamu administrátorských uživatelů:', (data && data.error) || 'Neplatná data ze serveru.');
            renderFallbackAdminUsers(listContainer, 'Chyba při načítání uživatelů.');
            return;
        }

        setAdminFeedback(`Načteno hráčů: ${data.users.length}`);
        renderAdminUsersList(data.users);
    } catch (e) {
        if (request !== adminUsersRequest || !isCurrentUserAdmin()) return;
        console.warn('[AdminUI] Chyba při načítání seznamu administrátorských uživatelů:', e);
        renderFallbackAdminUsers(listContainer, 'Chyba připojení k serveru.');
    }
}

function renderAdminUsersList(users) {
    if (!isCurrentUserAdmin()) return;
    adminCachedUsers = (users || adminCachedUsers || []).filter(u => typeof u?.username === 'string');
    const listContainer = document.getElementById('admin-users-list');
    if (!listContainer) return;

    const query = (document.getElementById('admin-users-search')?.value || '').trim().toLowerCase();
    const filtered = adminCachedUsers.filter(u => !query || (u.username && u.username.toLowerCase().includes(query)));

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-6 text-xs">Žádní hráči nenalezeni.</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(u => {
        const escapedName = u.username.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        const usernameArgument = JSON.stringify(u.username).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        const isMe = typeof authState !== 'undefined' && authState.user && authState.user.username && authState.user.username.toLowerCase() === u.username.toLowerCase();
        return `
            <div class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-3 rounded-xl bg-[#191B1D] border border-[#2C2F33] hover:border-amber-500/30 transition">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                        ${escapedName[0].toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-xs text-white truncate">${escapedName}</span>
                            ${isMe ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">TY</span>' : ''}
                        </div>
                        <div class="text-[11px] text-[#FFE066] font-semibold">${Number(u.coins || 0).toLocaleString('cs-CZ')} B$</div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" data-admin-economy onclick="submitAdminGiveCoins(1000, 'add', ${usernameArgument})" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-[#2C2F33] hover:bg-[#393B3D] text-[#FFE066] transition flex items-center justify-center">+1k</button>
                    <button type="button" data-admin-economy onclick="submitAdminGiveCoins(10000, 'add', ${usernameArgument})" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-[#2C2F33] hover:bg-[#393B3D] text-[#FFE066] transition flex items-center justify-center">+10k</button>
                    <button type="button" data-admin-economy onclick="promptAdminSetCoins(${usernameArgument})" class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition flex items-center justify-center">Nastavit</button>
                </div>
            </div>
        `;
    }).join('');
}

function promptAdminSetCoins(targetUsername) {
    if (!isCurrentUserAdmin()) return;
    const raw = prompt(`Zadej nový počet Bobuxů pro hráče ${targetUsername}:`, '10000');
    if (raw === null) return;
    const num = Number(raw);
    if (raw.trim() && Number.isSafeInteger(num) && num >= 0) {
        submitAdminGiveCoins(num, 'set', targetUsername);
    }
}

if (typeof window !== 'undefined') {
    window.isCurrentUserAdmin = isCurrentUserAdmin;
    window.syncAdminCheatControls = syncAdminCheatControls;
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
        syncAdminCheatControls,
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

let adminSocialRequest = 0;
let adminSocialPending = false;

function openAdminRatings() {
    const select = document.getElementById('admin-ratings-game');
    if (!select || !isCurrentUserAdmin()) return;
    if (!select.options.length) {
        for (const game of GAMES_CATALOG) {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.title || game.name || game.id;
            select.appendChild(option);
        }
    }
    loadAdminRatings();
}

async function loadAdminRatings() {
    if (!isCurrentUserAdmin()) return;
    const request = ++adminSocialRequest;
    const gid = document.getElementById('admin-ratings-game').value;
    const list = document.getElementById('admin-ratings-list');
    list.textContent = 'Načítání…';
    try {
        const res = await apiRequest(`/api/admin/games/${gid}/social`);
        if (request !== adminSocialRequest || !isCurrentUserAdmin()) return;
        if (!res.ok) throw new Error(res.data?.error || 'Načítání selhalo.');
        list.replaceChildren();
        for (const [label, rows] of [['Hlasy', res.data.ratings], ['Komentáře', res.data.comments]]) {
            const heading = document.createElement('h3');
            heading.textContent = `${label} (${rows.length})`;
            list.appendChild(heading);
            for (const row of rows) {
                const item = document.createElement('div');
                item.className = 'bg-[#2C2F33] rounded-lg p-3 break-words';
                item.textContent = `${row.username}: ${row.vote ? (row.vote === 'like' ? '\uD83D\uDC4D Like' : '\uD83D\uDC4E Dislike') : row.content}`;
                if (!row.vote) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'min-h-[44px] px-3 text-[#FF4D4D]';
                    button.textContent = 'Smazat komentář';
                    button.onclick = () => mutateAdminSocial('delete-comment', gid, row.id);
                    item.appendChild(button);
                }
                list.appendChild(item);
            }
        }
    } catch (err) {
        if (request === adminSocialRequest && isCurrentUserAdmin()) list.textContent = err.message;
    }
}

async function mutateAdminSocial(action, gid, commentId) {
    if (!isCurrentUserAdmin() || adminSocialPending) return;
    if (!window.confirm(action === 'reset-ratings' ? 'Trvale smazat hodnocen\u00ed vybran\u00e9 hry z datab\u00e1ze? Koment\u00e1\u0159e z\u016fstanou.' : 'Trvale smazat tento koment\u00e1\u0159?')) return;
    adminSocialPending = true;
    try {
        const res = await apiRequest(`/api/admin/games/${gid}/${action}`, { method: 'POST', body: { commentId } });
        if (!res.ok) throw new Error(res.data?.error || 'Uložení selhalo.');
        if (!isCurrentUserAdmin()) return;
        setAdminFeedback('Změna byla uložena do databáze.');
        await loadAdminRatings();
        if (typeof fetchAllGamesSummary === 'function') await fetchAllGamesSummary();
        if (typeof refreshVisibleGameSocial === 'function') await refreshVisibleGameSocial();
    } catch (err) {
        setAdminFeedback(err.message, true);
    } finally {
        adminSocialPending = false;
    }
}
