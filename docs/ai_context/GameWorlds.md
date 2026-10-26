# GameWorlds.js - AI Context

## 1. Quick Summary (TL;DR)
`src/games/GameWorlds.js` obsahuje procedurální generování 3D prostředí, herní pravidla, interaktivní stanice a UI všech 12 miniher (Obby, Lava Tower, SFOTH, Tycoon, Natural Disasters, Tower of Hell, Zombie Outpost, Speed Run, Hide & Seek, Bedwars, Adopt Me! a Casino & Resort).

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a plní do globálního stavu (`gameSpecificData`):**
  - Obby: Seznam checkpointů, finish podium.
  - Lava: Rychlost stoupání lávového válce, výška hladiny lávy.
  - SFOTH / Zombies / Bedwars: Pole aktivních NPC botů (`bots`, `zombies`, `bedwarsEnemies`), spawnerů a wave counter.
  - Tycoon: Seznam koupených upgradů, droppery, sběrné zóny a stav hotovosti.
  - Disasters: Typ aktivní katastrofy (meteority, potopa, tornádo), rozpadatelné cihly.
  - Adopt Me!: Stav peněz (`bucks`), seznam zvířátek (`pets`), aktivní potřeby (`needs`), 3D mesh mazlíčka pobíhající za hráčem.
  - Casino: Herní stanice (`CASINO_STATIONS`), stav 3D blackjackového stolu (`bjTableState`), sloty (`slotsState`), kolo štěstí (`isWheelSpinning`, `wheelAutoSpin`, oddělená plátna `#casino-wheel-canvas` a `#lucky-wheel-canvas`), koňské dostihy (`derbyState`).
- **Čte a volá:**
  - `createBlock()`: Továrna na stavební prvky světa v `Engine.js`.
  - `addBobux()`, `spendBobux()`: Výplata odměn a sázení v `PortalStore.js`.
  - `grantCurrentUserVip()`: Udělení univerzálního VIP statusu při jackpotu na Kole štěstí.
  - `sfx`: Zvukové efekty v `SoundEngine.js`.

---

## 3. Key API Functions & Signatures
- **Generátory světů (volané z `Engine.js` -> `startGame`):**
  - `setupGame1Obby()`: Překážková dráha s checkpointy a lávovými kill-bloky.
  - `setupGame2LavaTower()`: Stoupající lávová věž se spirálovitými plošinami.
  - `setupGame3SFOTH()`: Plovoucí aréna s meči, platformami a boty.
  - `setupGame4Tycoon()`: Tycoon továrna s automatickými droppery a nákupními tlačítky.
  - `setupGame5Disasters()`: Zničitelný ostrov a procedurální přírodní katastrofy.
  - `setupGame6TowerOfHell()`: Procedurální patra válcové věže s lasery.
  - `setupGame7ZombieOutpost()`: Přežití proti vlnám zombií s nákupem zbraní.
  - `setupGame8SpeedRun()`: Závodní trať se zrychlovacími a skákacími pady.
  - `setupGame9HideAndSeek()`: Schovávaná s převleky za bednu/sud a skenerem.
  - `setupGame10Bedwars()`: 4 ostrovy týmů s postelemi a generátory surovin.
  - `setupGame11AdoptMe()`: Městečko Adopt Me, líheň vajec a péče o zvířátka.
  - `setupGame12Casino()`: 3D kasíno s blackjackem, kolem štěstí, automaty a dostihy.
- **Adopt Me subsystém:**
  - `saveAdoptMeData(bucks: number, pets: Array): void`: Uloží Adopt Me postup do LocalStorage a synchronizuje přes `syncAccountToServer()`.
  - `createAdoptMePetMesh(petId: string, isNeon?: boolean): THREE.Group`: Vygeneruje 3D model zvířátka.
  - `completeAdoptMeNeed(needId: string): boolean`: Splní potřebu mazlíčka a vyplatí Adopt Me Bucks.
- **Casino subsystém:**
  - `openCasinoModal(tabName?: string): void`: Otevře UI pro blackjack, automaty, kolo nebo dostihy.
  - `openLuckyWheelModal(): void`: Otevře samostatný modal Kola štěstí, aktualizuje zůstatek Bobuxů (`#wheel-modal-bobux-display`), stav AutoSpinu a překreslí plátno `#lucky-wheel-canvas`.
  - `getOrCreateWheelDiscCache(radius, numSlices, sliceAngle)`: Vytvoří a nacachuje offscreen buffer s 20 výsečemi, texty a diamantovým středem, čímž eliminuje per-frame slice re-rendering lag během animace.
  - `renderCasinoWheel(rotation)`: Vykreslí kolo štěstí s rotací s využitím offscreen disku; automaticky přeskakuje skrytá plátna (`offsetParent === null`).
  - `spinDailyWheel()` / `spinCasinoPaidWheel()`: Spustí roztočení kola štěstí s fyzikálním úhlem a výhrou (Jackpot uděluje `👑 VIP TAG` + 3 500 B$). Synchronizuje 3D `wheelMesh`/`wheelRotor`.
  - `updateWheelAutoSpinUI()`: Synchronizuje stav AutoSpinu (text, záře tlačítka, ikona) mezi aktivním a vypnutým stavem.
  - `spinSlotMachine(betAmount: number): void`: Vyhodnotí sázku na výherním automatu.

---

## 4. Lifecycle & Execution Hooks
- **Start minihry:** `startGame(gameId)` -> `setupGameX()` postaví scénu a nastaví počáteční `playerState.pos` a `spawnPoint`.
- **Per-frame tick:** Každý snímek smyčky `gameLoop` v `PhysicsAndLoop.js` volá odpovídající funkci `updateGameX(dt, elapsedSec)`.
- **Ukončení minihry:** `cleanupCurrentGame()` v `Engine.js` vynuluje `worldBlocks`, `movingBlocks` a `gameSpecificData`.

---

## 5. Anti-Duplication Rules & Gotchas
- **Všechny pevné bloky tvoř přes `createBlock()`**: Přímé přidávání meshů do scény bez registrace ve `worldBlocks` znefunkční kolize a zabíjení kill-bricky.
- **Odměny v Bobuxech VŽDY zapisuj přes `addBobux(amount, reason)`**: Nikdy neupravuj `bobuxBalance` přímo – přišel bys o záznam v transakční historii a cloud synchronizaci.
- **Proximity Prompts [E]**: Interakce se stanicemi v kasínu a Adopt Me se vážou na `triggerPrimaryAction()` v `PhysicsAndLoop.js`.

---

## 6. Code Snippets / Seams

### Seam A: Stavba světa překážkové dráhy (Obby)
```javascript
// src/games/GameWorlds.js: L12-L28
function setupGame1Obby() {
    createBlock(0, -1, 0, 16, 2, 16, 0x4CAF50); // Startovní podlaha
    createBlock(0, 0, -12, 4, 1, 4, 0x2196F3, { isCheckpoint: true, checkpointIdx: 1 });
    createBlock(0, -0.5, -20, 12, 0.5, 4, 0xFF0000, { isKill: true });
```

### Seam B: Adopt Me perzistence mazlíčků
```javascript
// src/games/GameWorlds.js: L1065-L1080
function saveAdoptMeData(bucks, pets) {
    localStorage.setItem(STORAGE_KEY_ADOPTME_BUCKS, String(bucks));
    localStorage.setItem(STORAGE_KEY_ADOPTME_PETS, JSON.stringify(pets));
    if (typeof syncAccountToServer === 'function') syncAccountToServer();
}
```

### Seam C: Interaktivní 3D stoly v kasínu
```javascript
// src/games/GameWorlds.js: L1650-L1665
function setup3DBlackjackTable() {
    const feltMesh = new THREE.Mesh(feltGeo, feltMat);
    feltMesh.userData = { isCasinoStation: true, stationId: 'blackjack', promptText: 'Stiskni [E] pro Blackjack' };
    scene.add(feltMesh);
```
