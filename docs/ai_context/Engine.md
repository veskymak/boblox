# Engine and resource lifecycle (v9.4)

Engine.js owns scene, renderer, camera, playerState, worldBlocks, movingBlocks and game startup/cleanup. createBlock registers collision boxes and invalidates the spatial index. startGame starts the selected world and requests an authenticated game session without uploading local economy/progress.

SpatialIndex.js owns an 8-unit spatial grid. Static boxes are indexed; moving, destructible and player-built blocks remain dynamic candidates. Huge blocks bypass grid expansion. Candidate order follows worldBlocks; mutations via createBlock invalidate the grid, and array/length changes rebuild it. Physics retains exact AABB tests and step-up behavior.

SceneResources.js provides disposeObject(object,sharedTexture). It deduplicates geometry/material/texture references and preserves explicitly cached/shared assets. AvatarAndShop.disposeObject3D delegates to it; cleanupCurrentGame uses the same implementation. Cleanup cancels the main frame loop, disables casino autospin, unmounts Adopt Me UI, releases scene resources and clears per-game state. Shop close releases its preview renderer and scene.

Seams: createBlock, cleanupCurrentGame, startGame, SpatialIndex.query, BobloxSceneResources.disposeObject. Tests: game-load-integrity, spatial-index-and-resources, casino lifecycle regressions. Do not rename existing DOM IDs or introduce a second gameplay frame loop.

Lifetime.js owns game-scoped timeout/interval handles. GameWorlds uses gameTimers; cleanup resets them and advances a generation counter, so pending server responses cannot start obsolete animations after leaving a world.

## Shared blackjack and radio (v9.9)
Stand up before casino cleanup so an in-flight table response cannot render into a new world.
