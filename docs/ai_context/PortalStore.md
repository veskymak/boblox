# Account state and transport (v9.4)

## Ownership and entry points
- `PortalStore.js`: authState, STORAGE_KEYS, account hydration, profile sync queue, apiRequest and public social reads.
- `AccountBackend.js`: one `request(sb,path,options)` interface. Supabase Auth is verified with getUser; account writes use authenticated account_command RPC. The sb_jwt_* value is only a UI marker, never authorization.
- `AccountCommands.js`: serial economic commands, request UUIDs and account-identity checks. Only confirmed server snapshots update persistent state. Older revisions cannot overwrite newer snapshots.
- `AccountSocial.js`: targeted friendship operations, account-scoped cache reset, 10-second visible-page refresh, persisted direct-message reads and read-only announcements. No private text is broadcast publicly.

## Commands and persistence
Cloud account operations never fall back to Node or an offline account database. Offline API operations return 503; guest gameplay can keep local practice state. No password hashes are generated/verified in the browser.
syncAccountToServer sends only bio, outfit, torsoHex and the current revision. Coins, VIP, ownership, pet progress, friend lists and transactions are not part of generic sync. A conflict is an error, never a local success. Account responses are guarded by identity and monotonic revision; logout clears private social caches.
accountCommand(command,payload,requestId) serializes mutations and applies authoritative results. Purchase, daily, slots, wheel, derby, blackjack, Adopt Me actions and bounded participation rewards have server rules. The UI never calls admin_give_coins to save its own balance.
addBobux in an authenticated game requests a capped participation reward; arbitrary client amounts/reasons have no authority. spendBobux refuses direct authenticated spending; concrete purchases/bets use commands. Guest balances never migrate into a registered wallet.

## Seams and verification
Relevant symbols: apiRequest, applyAuthenticatedUser, syncAccountToServer, accountCommand, refreshAccountSocial. index.html loads account modules before PortalStore; their globals are resolved at call time. Keep all browser APIs behind apiRequest.
Regression surface: account-commands.integration.test.js, bobux-pagehide-persistence*.test.js, account-sync-ordering.test.js, supabase-blackjack-coins-rpc-sync.test.js, supabase-chat-transactions-and-friends-cache.test.js, and supabase-account-security.sql (rolled back on the live project).
Two legacy profiles without matching Auth users require verified recovery. Never reintroduce public-hash login or bind accounts merely by matching editable metadata/usernames.

Each RPC pins the verified session access token on its PostgREST request. Switching SDK sessions while a command is in flight cannot redirect that write into the new account. Friendship responses also check the originating account identity before applying snapshots.
