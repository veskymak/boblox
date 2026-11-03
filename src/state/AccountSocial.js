let accountSocialRefreshPending = false;
const seenAnnouncements = new Set();
async function mutateAccountFriend(action, targetUsername) {
    const identity = accountIdentity();
    try {
        const result = await apiRequest('/api/friends/' + action, {
            method: 'POST',
            body: { targetUsername }
        });
        if (accountIdentity() !== identity) return;
        if (!result.ok) throw new Error(result.data?.error || 'Změna přátelství nebyla uložena.');
        if (result.data.user) applyAuthenticatedUser(result.data.user);
        await refreshAccountSocial();
        if (typeof renderHomeFriendsStrip === 'function') renderHomeFriendsStrip();
        if (typeof renderPeopleResultsGrid === 'function') renderPeopleResultsGrid();
    } catch (error) {
        reportAccountError(error);
    }
}
function resetAccountSocialCaches() {
    if (typeof friendsSet !== 'undefined') friendsSet.clear();
    if (typeof sentFriendRequests !== 'undefined')
        Object.keys(sentFriendRequests).forEach((k) => delete sentFriendRequests[k]);
    if (typeof receivedFriendRequests !== 'undefined')
        Object.keys(receivedFriendRequests).forEach((k) => delete receivedFriendRequests[k]);
    if (typeof lobbyDirectMessages !== 'undefined')
        Object.keys(lobbyDirectMessages).forEach((k) => delete lobbyDirectMessages[k]);
    if (typeof unreadDirectMessages !== 'undefined')
        Object.keys(unreadDirectMessages).forEach((k) => delete unreadDirectMessages[k]);
}
async function refreshAccountSocial() {
    if (accountSocialRefreshPending || document.hidden) return;
    if (typeof accountSyncQueue !== 'undefined' && accountSyncQueue) return;
    accountSocialRefreshPending = true;
    const identity = accountIdentity();
    try {
        if (isServerAccount()) {
            const response = await apiRequest('/api/auth/me');
            if (accountIdentity() !== identity) return;
            if (
                response.ok &&
                response.data.user &&
                Number(response.data.user.revision || 0) >= Number(authState.user.revision || 0)
            )
                applyAuthenticatedUser(response.data.user);
            if (typeof syncDirectChatMessages === 'function') await syncDirectChatMessages();
        }
        const announcements = await apiRequest('/api/announcements');
        if (accountIdentity() !== identity || !announcements.ok) return;
        for (const announcement of announcements.data.announcements || []) {
            if (seenAnnouncements.has(announcement.id)) continue;
            seenAnnouncements.add(announcement.id);
            if (typeof handleIncomingAdminBroadcast === 'function')
                handleIncomingAdminBroadcast({
                    message: announcement.message,
                    sender: announcement.sender,
                    id: announcement.id
                });
        }
        if (seenAnnouncements.size > 100) seenAnnouncements.clear();
    } finally {
        accountSocialRefreshPending = false;
    }
}
const accountSocialTimer = setInterval(() => refreshAccountSocial().catch(() => {}), 10000);
if (accountSocialTimer?.unref) accountSocialTimer.unref();
if (typeof document !== 'undefined')
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshAccountSocial().catch(() => {});
    });
