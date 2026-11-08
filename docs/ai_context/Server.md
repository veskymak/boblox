# Node backend (v9.4)

server.js owns Express, SQLite schema, authentication, public social data and the WebSocket gateway. server/AccountCommands.js owns authenticated economic commands, idempotency records, a wallet ledger and command-private state. server/Blackjack.js owns shuffled decks, split hands, draws and payouts behind advance(). The active production backend is Supabase; Node is an alternative deployment, not a fallback identity system.

## Security and configuration
Starting server.js requires JWT_SECRET with at least 32 characters. Library/test use gets an ephemeral random secret when not configured; tests explicitly configure their own keys. ADMIN_USER_ID determines administrative authority, never presence or the username. ALLOWED_ORIGINS is an explicit comma-separated CORS/WS allowlist. Production cookies use Secure. Auth requests and WS packet size/frequency are limited.
Only /, /index.html, /version.json, /src and /assets are publicly served. Never restore express.static(__dirname). BOBLOX_DB_PATH can place SQLite outside the repo; node --test uses isolated memory databases.
/api/user/sync rejects financial/progress/social snapshots, checks item ownership and optional revision. /api/account/command accepts only concrete validated commands with a request UUID; replaying the same request does not pay twice. Wallet updates are audited by a SQLite trigger; /api/transactions reads only the current user's ledger. No password hashes are serialized.
Private messages persist through authenticated HTTP endpoints; WebSocket social_event is never a write or a relay of private content. Admin WS broadcasts verify JWT and configured admin ID. Game packets remain untrusted cosmetic replication, not proof for economic rewards.

## Tests
account-commands.integration.test.js verifies real HTTP persistence, replay, concurrent purchase and static-file isolation. blackjack-server-rules.test.js covers natural blackjack and splitting. Existing admin, bio, direct-chat and social integration tests continue using real SQLite. Every server edit must update this document.

## Age confirmation (v9.7)
AccountConsentUI owns a native blocking dialog. Registration requires only an unchecked age-over-15 checkbox. There is no activity consent checkbox or activity consent requirement. /api/auth/consent reads and inserts account-scoped server records (Supabase account_consents with RLS; SQLite equivalent). No localStorage eligibility. Failed requests leave the dialog open; identity checks ignore stale responses. Presence and last activity operate independently of age confirmation. Recovery email invitation waits for consent. Confirmed email signups without an immediate session reconfirm after login. Apply docs/supabase/account_consent.sql before releasing the client. Google font stylesheet was removed; index uses system fonts.

Deployment: account_consents schema and RLS applied to boblox-db on 2026-11-08; rollback-only test verified own-record visibility. 15 focused Node tests pass; full HTTP suite is blocked by localhost EACCES in this environment. Frontend publication remains pending due to read-only .git.

V9.7 stops collecting activity_consent. Its legacy nullable column is retained without client insert permission to preserve historical records. /api/auth/consent POST validates ageOver15 only. Registration and mandatory existing-account dialog require age only.

## Privacy (v9.8)
server/Privacy.js installs authenticated GET /api/auth/privacy-export after AccountCommands initializes tables. Fixed req.userRow identity, DMs include historical recipient usernames, response no-store, no hashes or cached command results. No arbitrary-user export or public erasure API. /privacy.html is explicitly allowlisted; operator documents remain private. test/privacy.test.js uses real SQLite across fresh export requests without localhost networking. Production SQL export was deployed; rollback-only security tests passed.
