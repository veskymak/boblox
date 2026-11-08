# Multiplayer transport (v9.4)

NetworkManager.js owns mpState, PeerJS, WebSocket and Supabase Realtime channel lifecycles. Player simulation remains client-side; replicated positions/actions never authorize wallet or administrative writes.

sendMultiplayerPacket chooses one room transport: subscribed Supabase channel, otherwise open WebSocket, otherwise open WebRTC peers, otherwise BroadcastChannel. The channel's bobloxReady flag is set by subscription callbacks. Do not fan the same packet across all transports. WebSocket/WebRTC queues over 64 KiB drop ephemeral packets instead of growing indefinitely. Player state keeps the 20 Hz tick.
Packets include sequence/stream metadata; older position snapshots are ignored using a bounded map. Incoming identifiers reject prototype keys and invalid lengths; numeric transforms must be finite and bounded. These guards do not turn peer replication into authoritative gameplay.

Private chat and friendship writes go through apiRequest and persist before UI success. Public social broadcasts are hints only: PortalUI refreshes authenticated state rather than trusting private-message/admin payloads. Admin announcements are persisted and polled from a publicly readable, write-protected table. NetworkManager never publishes direct-message text or admin authorization onto public social channels.

Main seams: sendMultiplayerPacket, handleMultiplayerPacket, broadcastLocalPlayerState, sendSocialBroadcast, initLiveSocketAndPresence. Preserve room setup/cleanup and existing PeerJS host relay for fallback-only mesh sessions.

## Age confirmation (v9.7)
AccountConsentUI owns a native blocking dialog. Registration requires only an unchecked age-over-15 checkbox. There is no activity consent checkbox or activity consent requirement. /api/auth/consent reads and inserts account-scoped server records (Supabase account_consents with RLS; SQLite equivalent). No localStorage eligibility. Failed requests leave the dialog open; identity checks ignore stale responses. Presence and last activity operate independently of age confirmation. Recovery email invitation waits for consent. Confirmed email signups without an immediate session reconfirm after login. Apply docs/supabase/account_consent.sql before releasing the client. Google font stylesheet was removed; index uses system fonts.

Deployment: account_consents schema and RLS applied to boblox-db on 2026-11-08; rollback-only test verified own-record visibility. 15 focused Node tests pass; full HTTP suite is blocked by localhost EACCES in this environment. Frontend publication remains pending due to read-only .git.

V9.7 stops collecting activity_consent. Its legacy nullable column is retained without client insert permission to preserve historical records. /api/auth/consent POST validates ageOver15 only. Registration and mandatory existing-account dialog require age only.

## Privacy (v9.8)
Removed obsolete hasAccountConsent guards from updateSocialPresenceTrack, broadcastSocialPresence and sendWsPresence: these are availability features. privacy.html discloses PeerJS, WebRTC peers and configured Google STUN. Removing Google Fonts does not remove these connections. Visibility safeguards and supplier arrangements still need operator assessment in docs/privacy/operations.md.
