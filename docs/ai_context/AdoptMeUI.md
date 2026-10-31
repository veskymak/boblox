# Adopt Me interface

`src/ui/AdoptMeUI.js` owns only transient panel/navigation state in `gameSpecificData`: `adoptTab`, `adoptDestination`, `adoptUITimer`. Persistent Bucks and pets remain in GameWorlds and PortalStore account sync.

- `mountAdoptMeUI()` mounts inside `game-viewport` during `setupGame11AdoptMe`; `unmountAdoptMeUI()` removes it from `cleanupCurrentGame`.
- `renderAdoptMePanel()` is called by `refreshAdoptMeHUD`. Tabs: care, collection, atlas (including actual egg pool odds), navigation, help. No new animation loop.
- `selectAdoptMePet(index)` validates the index, dismounts, resets movement multipliers and timed activity, then respawns the active mesh. Both collection and hotbar switching use it.
- `updateAdoptMeNavigation(dt)` updates the camera-relative direction/distance and activity progress at 4 Hz from the existing Adopt Me tick.
- Static text/catalog values alone enter generated HTML; no player-controlled names are interpolated.
- Styles are scoped to `#adoptme-ui` and `adopt-*` in index.html; controls have 44px targets. The overlay passes through pointer events except for controls/panels and stops pointerdown reaching the canvas.
- Regression: `node --test test/adoptme-progress.test.js test/game-load-integrity.test.js`.
