# Physics and game loop (v9.4)

PhysicsAndLoop.js owns the single gameplay requestAnimationFrame loop, player AABB, movement, exact collision resolution, particles and game update dispatch. Engine owns the shared scene/player/world state; GameWorlds owns mode state.

resolvePlayerCollisions queries collisionIndex with correction margin and step-up headroom, then performs the existing exact AABB tests in stable world order. Its inner headroom test uses the same candidates. Moving/destructible blocks remain dynamically tested, so moving geometry is not frozen in a static index. spatial-index-and-resources.test.js compares candidates against exact collisions over 10,000 blocks.

Authenticated reward amounts are never accepted from this loop: addBobux requests a server-capped participation reward. Adopt Me passive tree/trade actions use accountCommand and only confirmed snapshots update persisted Bucks/pets. Guest practice remains local. Physical proximity and NPC outcomes are still client simulated; this is not a server-authoritative anti-cheat engine.

Seams: gameLoop, resolvePlayerCollisions, triggerPrimaryAction, updateGame11AdoptMe. Preserve godmode/void safety, main-loop timing and existing 44px mobile controls. No extra gameplay animation loop.
