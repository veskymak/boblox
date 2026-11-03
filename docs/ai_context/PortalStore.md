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

## Recovery email enrollment (v9.5)
`AccountBackend.request` owns `/api/auth/email-status`, `email-dismiss`, `email`, `reset-password` and `password`. UI goes through `apiRequest`. New signups require a real email (internal `@boblox.cz` aliases are rejected). A signup without a session returns `confirmationRequired`, never a fake authenticated user. After confirmation, `/auth/me` can create a new profile via the guarded `register` command; pre-migration orphan profiles cannot be claimed by matching metadata.

Username/email login uses deployed `account-login` Edge Function; only its service-role-only lookup can resolve usernames to private Auth email addresses. The browser receives a session only after password verification, then installs it with `setSession`. Password reset uses Auth's recovery link and `PASSWORD_RECOVERY` event. Existing account email changes use `auth.updateUser` and require confirmation before becoming active.

`docs/supabase/email_recovery.sql` is applied as `one_time_recovery_email`. Private `email_enrollment` snapshots accounts existing at deployment, persists refusal/selected target and enforces a single target with an `auth.users` trigger. New accounts cannot subsequently change email. Pending confirmation of the selected target remains allowed. The status RPC checks `auth.uid()` and reveals no email; service-only name lookup grants no browser access. See `test/recovery-email-security.sql` (rollback-only database test) and `test/recovery-email.test.js`.

Deployment configuration: Confirm email is enabled (public Auth settings verified `mailer_autoconfirm=false` on 2026-11-03). The user confirmed disabling Secure email change for legacy synthetic addresses, which have no inbox. The connected MCP cannot change Auth configuration. The hosted app URL must be configured as Site URL / allowed redirect URL. The deployed login function returns a generic 401 for invalid credentials, verified over HTTP. Delivery to a real inbox still needs an end-to-end user check.
