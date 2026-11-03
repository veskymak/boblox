# Portal UI (v9.4)

PortalUI.js owns catalog/profile/social rendering, ESC menu, direct-chat presentation and update notifications. AccountBackend/AccountCommands/AccountSocial own authenticated transport, persistence and refresh; UI must not create secondary fetch calls or reinterpret failed persistence as success.

sendLobbyDirectChatMessage waits for persisted /api/chat/messages before clearing the input and loading server messages. No private text is broadcast publicly. syncDirectChatMessages ignores delayed responses after account changes. Friendship request/accept/cancel/reject/remove use targeted mutations, then refresh private account state; whole friend lists never go through profile sync.
Public social broadcasts are refresh hints, not authority. The authenticated path no longer reconstructs friend state from public cached inventories. AccountSocial clears per-account caches and refreshes on visible-page intervals/resume. Existing DOM IDs and rendering functions remain stable for callers and tests.

Game detail reads/writes still capture selected game IDs, reject local-only success, refresh visible details every 15 seconds and ignore delayed responses for another selected game. Update detection derives the client version from script URLs; version.json and all script query versions must agree.

Seams: sendLobbyDirectChatMessage, syncDirectChatMessages, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, handleIncomingSocialPacket, loadGameSocialDetails. UI classes must retain 44px controls and the canonical Bobux color. Browser layout/physical-device verification is separate from the DOM/HTTP test suite.

Supabase comments and votes now carry immutable user_id authors. Database triggers enforce matching usernames/author IDs, game IDs, comment length and a 30-second comment cooldown. Client cooldown checks are presentation only.
