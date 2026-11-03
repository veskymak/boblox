# Supabase security hardening — 2026-11-03

Applied directly to production project `vfbdsclqvsjbzzhyaegw` through Supabase MCP. SQL is preserved in `security_hardening_2026_11_03.sql`; this is a historical migration, not an idempotent setup script. Older schema_update scripts must not be reapplied because they restore insecure policies/functions.

## Changes

- Public profiles retain an empty password_hash compatibility column. Original values were moved, without exporting them, to RLS-protected `boblox_private.legacy_credentials`, inaccessible to browser roles. Future writes cannot store hashes in public profiles.
- Admin coin RPC rejects anonymous/non-admin callers using the existing administrator UUID, validates inputs and locks the target row. Admin social moderation now uses the same UUID. Anonymous execution revoked for both functions.
- Profile trigger protects coins, identity, inventory entitlements, Adopt Me progress and daily timestamps from direct non-admin changes. Profile creation normalizes protected state to starter defaults. Outfit changes require owned items.
- Social policies bind writes to the authenticated profile username. Usernames are immutable for ordinary accounts. Future schema work should use immutable author IDs.
- Removed unnecessary browser TRUNCATE/REFERENCES/TRIGGER privileges. Optimized auth.uid policy evaluation and added a comments game/time index.

## Client compatibility and remaining work

Five of seven profiles have matching Auth users. Two legacy profiles require secure account recovery/migration; legacy client hash login is intentionally disabled. No Auth users or player profiles were deleted.

The currently deployed client computes economy/progress locally. Its writes changing protected fields now fail with SQLSTATE 42501. This includes purchases, game rewards, daily claims, VIP and Adopt Me progress. Implement validated server-side commands and update the client before treating those features as operational. Do not reopen generic own-profile financial writes. Current sync bundles may also reject unrelated edits when a protected field differs.

Public inventory remains visible under the existing profile read model; move private social state out of it in the follow-up. direct_messages and transactions tables are still absent; this migration does not introduce those features. No Edge Functions were present.

Leaked-password protection remains disabled: available MCP tools do not expose Auth configuration updates. Enable it in the dashboard if the project's plan supports it. Security Advisor still reports authenticated SECURITY DEFINER RPC execution; intentional, with authorization enforced and tested inside both functions.

## Verification

Role-based tests run inside rolled-back transactions: anonymous/admin RPC authorization, blank public hashes, protected coins/VIP/identity, private credential isolation, own comments/votes allowed, impersonated comments and foreign vote updates denied, ordinary activity updates allowed, administrator coin and moderation calls allowed. Test writes were rolled back. No broad log scans were performed.
