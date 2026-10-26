# PhysicsAndLoop.js - AI Context

## 1. Quick Summary (TL;DR)
`src/core/PhysicsAndLoop.js` řídí centrální herní smyčku (`gameLoop` poháněný `requestAnimationFrame`), veškerou fyziku hráče (pohyb, gravitace, skoky, žebříky, pohybující se plošiny), diskrétní AABB kolizní detekci a primární akce hráče (útoky zbraněmi, pokládání bloků, interakce). Slouží jako centrální integrační bod spojující vstup uživatele, stav světa, vykreslení Three.js scény a distribuci stavu do multiplayeru.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a modifikuje lokálně:**
  - `_playerBox` (`THREE.Box3`): AABB ohraničení těla lokálního hráče.
  - `juiceParticles` (`Array`): Seznam aktivních 3D částic pro vizuální efekty (zásahy, zlaťáky, konfety).
  - `fpsFrames`, `fpsLastTime`, `lastTickTime`: Časovače pro výpočet delta času (`dt`) a metriky FPS.
  - `screenShakeTime`, `screenShakeIntensity`: Stav třesu kamery při výbuchu nebo poškození.
- **Čte a modifikuje (Sdílený herní stav):**
  - `playerState`: Pozice (`pos`), rychlost (`vel`), `knockback`, `onGround`, `onLadder`, `coyoteTimer`, `hp`, `maxHp`, `invulnTimer`, `forcefieldTimer`, `activeWeapon`, `weaponCooldownTimer`, `weaponReloadTimer`.
  - `worldBlocks`: Pole všech pevných objektů ve scéně `{ mesh, box, isKill, isLadder, isBoost, isCheckpoint, movingFn, destructible }`.
  - `movingBlocks`: Dynamická podmnožina `worldBlocks` s platným `movingFn(elapsedSec)`.
  - `gameSpecificData`: Stav aktuální minihry (např. vlny zombie, tycoon nákupní zóny, Adopt Me potřeby).
- **Pouze čte:**
  - `activeGameMode` (např. `'obby'`, `'sfoth'`, `'casino'`, `'adoptme'`).
  - `keysPressed`: Map stisknutých kláves z `InputManager.js`.
  - `camState`: Sférické souřadnice kamery (`yaw`, `pitch`, `distance`).

---

## 3. Key API Functions & Signatures
- `gameLoop(now: DOMHighResTimeStamp): void`
  - Hlavní smyčka volaná přes `requestAnimationFrame`. Spočítá `dt`, aplikuje vstupy, vyřeší kolize, zavolá update specifické minihry, animuje avatara, posune kameru a provede `renderer.render(scene, camera)`.
- `resolvePlayerCollisions(dt: number): void`
  - Testuje průnik `_playerBox` s `worldBlocks`. Řeší pevné stěny, kill-bricky (`damagePlayer(999)`), žebříky (`playerState.onLadder = true`), boost-pady a pohybující se plošiny.
- `triggerPrimaryAction(): void`
  - Vyvolána kliknutím myši nebo tlačítkem akce. Podle `playerState.activeWeapon` spustí útok mečem, výstřel z pistole/brokovnice, položení bloku, použití medkitu nebo Adopt Me péči. V režimu Kasína deleguje na `triggerCasinoProximityAction()` pro spuštění stanice u hráče bez inventářních položek.
- `checkVoidFall(): void`
  - Kontroluje pád pod úroveň `playerState.pos.y < -22`. Pokud je aktivní Godmode, hráče bezpečně teleportuje na spawn; v běžném režimu udělí smrtící poškození.
- `applyBotDamage(bot: Object, dmg: number, knockbackPower: number): void`
  - Udělí poškození PvE NPC (zombies, Bedwars stráže, SFOTH boti), odečte HP, aplikuje knockback a při 0 HP vyvolá eliminaci.
- `spawnJuiceParticles(x: number, y: number, z: number, colorHex: number, count?: number, speed?: number, scale?: number): void`
  - Vygeneruje částicový efekt v daných 3D souřadnicích.
- `updateGame1Obby(dt: number): void`
  - Společný aktualizační cyklus pro částice konfet (`gameSpecificData.confettiParticles`) sdílený mezi Obby cílem a Kasínem. Podporuje jednotný kontrakt `{ mesh, vel, life, rotSpeed }` i přímé mesh objekty s `userData`, automaticky uvolňuje Three.js geometrie a materiály.
- `triggerScreenShake(intensity?: number, duration?: number): void`
  - Nastaví parametry třesu kamery pro dramatický efekt při poškození či explozi.
- **Kamera a usednutí u Blackjack stolu v Kasínu**:
  - Když `activeGameMode === 'casino'` a `gameSpecificData.isPlayerSeatedAtBj`, hráč je usazen na židli u stolu (`seat.pos` / `seat.chairPos`), rotace těla směřuje ke středu stolu (-18, -8) a kamera přechází do vyvýšeného pohledu shora (výška očí ~4.15m, cíl `(-18, 2.1, -6.8)`), což zajišťuje přehledný širokoúhlý výhled shora na celý stůl, vlastní i krupiérovy karty a žetony bez jakéhokoliv zakrývání. Vlastní avatar hráče je v first-person pohledu dočasně skryt, aby nepřekážel ve výhledu.

---

## 4. Lifecycle & Execution Hooks
- **Každý render snímek (`requestAnimationFrame`):**
  1. Spočítá delta čas: `dt = Math.min(0.05, (now - lastTickTime) / 1000)`.
  2. Dekrementuje časovače (`invulnTimer`, `weaponCooldownTimer`, `coyoteTimer`, `forcefieldTimer`).
  3. Integruje pohyb: `keysPressed` + `_touchMoveVector` -> směr kamery -> `playerState.vel` -> `playerState.pos`.
  4. Posune plošiny: volání `movingFn(elapsedSec)` pro každý prvek v `movingBlocks`.
  5. Provede kolize: `resolvePlayerCollisions(dt)` a následně `checkVoidFall()`.
  6. Aktualizuje animaci končetin a natočení hlavy lokálního avatara `playerAvatar`.
  7. Spustí dispatcher pro konkrétní minihru: `updateGameX(dt, elapsedSec)`.
  8. Zpracuje multiplayer: `updateRemotePlayersInScene(dt)` a `broadcastLocalPlayerState(dt)`.
  9. Aktualizuje částice a bubliny chatu: `updateJuiceParticles(dt)` a `updateAvatarChatBubbles(playerAvatar, dt)`.
  10. Umístí kameru podle `camState` s raycast ochranou proti průchodu zdí a zavolá `renderer.render()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **NIKDY nevytvářej novou `requestAnimationFrame` smyčku**: Všechny herní animace a tiky miniher musí být zapojeny do existující funkce `updateGameX` nebo registrovány přes `movingBlocks`.
- **NIKDY nepoužívej vlastní AABB kód v minihrách**: Pokud potřebuješ detekovat pevnou překážku, přidej objekt do pole `worldBlocks` s korektně nastaveným polem `box: new THREE.Box3()`.
- **Pozor na změnu pozice hráče**: Nikdy nenastavuj `playerState.pos` bez aktualizace `_playerBox.min` a `_playerBox.max`, jinak hráč propadne podlahou nebo uvízne ve zdi.
- **Godmode ochrana**: Při implementaci nových pastí a smrtících zón vždy ověř `playerState.godmode` před přímým zabitím hráče.

---

## 6. Code Snippets / Seams

### Seam A: Napojení smyčky nové minihry (gameLoop dispatcher)
```javascript
// src/core/PhysicsAndLoop.js: L927-L939
if (activeGameMode === 'adoptme') updateGame11AdoptMe(dt, elapsedSec);
else if (activeGameMode === 'obby') updateGame1Obby(dt);
else if (activeGameMode === 'casino') updateGame12Casino(dt, elapsedSec);
```

### Seam B: Integrovaná AABB kolize s bloky světa
```javascript
// src/core/PhysicsAndLoop.js: L529-L536
for (let i = 0; i < worldBlocks.length; i++) {
    const b = worldBlocks[i];
    if (b.flyingDebris || !_playerBox.intersectsBox(b.box)) continue;
    if (b.isKill) { damagePlayer(999, 'Dotyk smrtícího bloku!'); return; }
```

### Seam C: Bezpečný dopad do prázdnoty a respawn
```javascript
// src/core/PhysicsAndLoop.js: L395-L403
function checkVoidFall() {
    if (typeof playerState !== 'undefined' && playerState.pos && playerState.pos.y < -22) {
        if (playerState.godmode) { respawnPlayer(); }
        else { damagePlayer(999, 'Pád do prázdnoty!'); }
    }
}
```
