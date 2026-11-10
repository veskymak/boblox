# Portal UI (v9.4)

PortalUI.js owns catalog/profile/social rendering, ESC menu, direct-chat presentation and update notifications. AccountBackend/AccountCommands/AccountSocial own authenticated transport, persistence and refresh; UI must not create secondary fetch calls or reinterpret failed persistence as success.

sendLobbyDirectChatMessage waits for persisted /api/chat/messages before clearing the input and loading server messages. No private text is broadcast publicly. syncDirectChatMessages ignores delayed responses after account changes. Friendship request/accept/cancel/reject/remove use targeted mutations, then refresh private account state; whole friend lists never go through profile sync.
Public social broadcasts are refresh hints, not authority. The authenticated path no longer reconstructs friend state from public cached inventories. AccountSocial clears per-account caches and refreshes on visible-page intervals/resume. Existing DOM IDs and rendering functions remain stable for callers and tests.

Game detail reads/writes still capture selected game IDs, reject local-only success, refresh visible details every 15 seconds and ignore delayed responses for another selected game. Update detection derives the client version from script URLs; version.json and all script query versions must agree.

Seams: sendLobbyDirectChatMessage, syncDirectChatMessages, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, handleIncomingSocialPacket, loadGameSocialDetails. UI classes must retain 44px controls and the canonical Bobux color. Browser layout/physical-device verification is separate from the DOM/HTTP test suite.

Supabase comments and votes now carry immutable user_id authors. Database triggers enforce matching usernames/author IDs, game IDs, comment length and a 30-second comment cooldown. Client cooldown checks are presentation only.

## Recovery email UI (v9.5)
`src/ui/RecoveryEmailUI.js` owns the native `recovery-email-modal` dialog and password recovery dialog. `applyAuthenticatedUser` schedules `refreshRecoveryEmailPrompt`; visibility resume rechecks persisted server state. Account identity checks discard stale responses. Refusal is saved via `/auth/email-dismiss` before closing; successful email submission hides the invitation on all devices. No localStorage flag controls eligibility.

The first submit expands the form, moves the blue CTA down into a green check and reveals the email input in its original position. CSS transitions in index.html respect reduced motion; native dialog provides focus confinement. The input is disabled before expansion so native validation does not block the first click. Submission failures retain the field and permit retry. Escape persists refusal. `sidebar-settings-btn` opens the existing `auth-modal`, including logout. Registration exposes a required email field; login accepts username or email. Forgot password reveals the email field and sends an Auth recovery link; `PASSWORD_RECOVERY` opens a new-password form.

Automated validation: 243 Node tests pass and rollback-only Supabase enrollment tests pass. Confirm email is verified enabled, and the user confirmed disabling Secure email change. Physical browser animation and delivery to a real inbox have not been verified; Auth configuration is documented in PortalStore.md.

## Age confirmation (v9.7)
AccountConsentUI owns a native blocking dialog. Registration requires only an unchecked age-over-15 checkbox. There is no activity consent checkbox or activity consent requirement. /api/auth/consent reads and inserts account-scoped server records (Supabase account_consents with RLS; SQLite equivalent). No localStorage eligibility. Failed requests leave the dialog open; identity checks ignore stale responses. Presence and last activity operate independently of age confirmation. Recovery email invitation waits for consent. Confirmed email signups without an immediate session reconfirm after login. Apply docs/supabase/account_consent.sql before releasing the client. Google font stylesheet was removed; index uses system fonts.

Deployment: account_consents schema and RLS applied to boblox-db on 2026-11-08; rollback-only test verified own-record visibility. 15 focused Node tests pass; full HTTP suite is blocked by localhost EACCES in this environment. Frontend publication remains pending due to read-only .git.

V9.7 stops collecting activity_consent. Its legacy nullable column is retained without client insert permission to preserve historical records. /api/auth/consent POST validates ageOver15 only. Registration and mandatory existing-account dialog require age only.

## Privacy (v9.8)
PrivacyUI.js owns openPrivacyCenter and exportPrivacyData. Native privacy-modal is reached from sidebar and auth settings, including guests. privacy.html is script-free, linked before registration and names Václav Pěkný / venda.pekny@gmail.com. Mailto links only prepare requests; users must send them. Export creates an account-scoped JSON Blob, ignores stale identity responses and never saves private data to localStorage. Notice discloses CDN, PeerJS, Google STUN, Supabase and hosting; it does not certify EU-only processing or GDPR compliance. Operator release checks are in docs/privacy/operations.md.

## Age dialog loading (v9.12)
AccountConsentUI.refreshAccountConsent keeps the dialog closed during the initial server read. Accepted accounts never call showModal; missing consent or a failed read opens the blocking dialog after completion. Account identity guards remain in place. Regression: test/account-consent.test.js checks zero dialog opens during and after a delayed accepted response.
