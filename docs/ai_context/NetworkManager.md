# Multiplayer transport (v9.4)

NetworkManager.js owns mpState, PeerJS, WebSocket and Supabase Realtime channel lifecycles. Player simulation remains client-side; replicated positions/actions never authorize wallet or administrative writes.

sendMultiplayerPacket chooses one room transport: subscribed Supabase channel, otherwise open WebSocket, otherwise open WebRTC peers, otherwise BroadcastChannel. The channel's bobloxReady flag is set by subscription callbacks. Do not fan the same packet across all transports. WebSocket/WebRTC queues over 64 KiB drop ephemeral packets instead of growing indefinitely. Player state keeps the 20 Hz tick.
Packets include sequence/stream metadata; older position snapshots are ignored using a bounded map. Incoming identifiers reject prototype keys and invalid lengths; numeric transforms must be finite and bounded. These guards do not turn peer replication into authoritative gameplay.

Private chat and friendship writes go through apiRequest and persist before UI success. Public social broadcasts are hints only: PortalUI refreshes authenticated state rather than trusting private-message/admin payloads. Admin announcements are persisted and polled from a publicly readable, write-protected table. NetworkManager never publishes direct-message text or admin authorization onto public social channels.

Main seams: sendMultiplayerPacket, handleMultiplayerPacket, broadcastLocalPlayerState, sendSocialBroadcast, initLiveSocketAndPresence. Preserve room setup/cleanup and existing PeerJS host relay for fallback-only mesh sessions.
