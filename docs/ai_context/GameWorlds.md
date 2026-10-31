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
  - `triggerCasinoProximityAction(): void`: Spustí aktivitu stanice, u které hráč právě stojí (`activeProximityStation`) po stisku klávesy [E], mobilního akčního tlačítka nebo kliku na úkolový banner (Blackjack -> `sitAt3DBlackjackTable`, Kolo štěstí -> `openLuckyWheelModal`, Automaty/Dostihy/Pokladna -> `openCasinoModal`).
  - `sitAt3DBlackjackTable(seatIdx?: number): void`: Usadí hráče ke stolu Blackjacku. Pokud není `seatIdx` zadán, automaticky vyhledá **nejbližší volnou židli** k aktuální pozici hráče (`playerState.pos`). Židle jsou umístěny ve vzdálenosti 5.7m od středu stolu, aby neclipovaly do opěrky. Pokud hráč nepotvrdí sázku (`confirmedBet === false`), zůstává sedět jako divák (nejsou mu rozdány karty ani odečteny Bobuxy; hra se nespustí, pokud nikdo nevsadil). Počáteční sázka začíná na 0 B$.
  - `addInWorldBjBet(amount: number): void`: Přidává žetony ke stávající sázce aditivně (`+10`, `+25`, `+50`, `+100`, `+250`, `+500`), kontroluje limit Bobuxů a vytváří/aktualizuje fyzický 3D sloupec žetonů na stole (`updateSeat3DChipStack`).
  - `clearInWorldBjBet(): void`: Resetuje sázku na 0 B$ (tlačítko `[✕]`) a odstraní 3D žetony ze stolu.
  - `updateSeat3DChipStack(seat)`: Spawnuje/aktualizuje 3D žetony na stole (výška `Y = 2.40`, přímo na zeleném plátně).
  - `resolveInWorldBlackjackPayout(dScoreObj)`: Vyhodnotí sázky, vyplatí Bobuxy přes `addBobux` a okamžitě synchronizuje stav konta do databáze (`syncAccountToServer({ bypassQueue: true })`).
  - `standUpFromBjTable(): void`: Zvedne hráče od stolu Blackjacku, obnoví viditelnost avatara, resetuje orbital kameru, skryje GUI score badge a vrátí hráče na podlahu kasína.
  - `setup3DBlackjackTable(): { tableGroup, dealerChar }`: Vygeneruje 3D půlkruhový blackjackový stůl v +Z orientaci s plátnem, opěrkou (armrest), táckem na žetony a dealer botou. Plátno stolu má povrch ve výšce Y = 2.39, karty i žetony jsou fyzicky umístěny na plátně (karty Y = 2.41, žetony Y = 2.40 vedle karet, dealer karty Z = -7.0). Skóre karet krupiéra i hráče je navíc promítáno přímo do popředí v 2D GUI HUDu (`#bj-inworld-dealer-badge` a `#bj-inworld-player-badge`).
  - `openCasinoModal(tabName?: string): void`: Otevře UI pro blackjack, automaty, kolo nebo dostihy.
  - `openLuckyWheelModal(): void`: Otevře samostatný modal Kola štěstí, aktualizuje zůstatek Bobuxů (`#wheel-modal-bobux-display`), stav AutoSpinu a překreslí plátno `#lucky-wheel-canvas`.
  - `closeLuckyWheelModal(): void`: Zavře modal Kola štěstí, vypne AutoSpin a vrátí fokus plátnu `#three-canvas` pro plynulé pokračování v hraní.
  - `spawnLuckyWheelConfettiBurst(originPos?: THREE.Vector3): void`: Vytvoří 120 3D konfetových částic při výhře na Kole štěstí podle kontraktu `{ mesh, vel, rotSpeed, life }`.
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
- **Proximity Prompts [E] v Kasínu**: Kasíno nemá žádné předměty v inventáři/hotbaru (`GAME_LOADOUTS.casino = []`), aby se předešlo nechtěnému klikání a otevírání oken. Interakce se stanicemi probíhá výhradně přiblížením k dané hře a stisknutím [E] (nebo kliknutím na proximity banner / mobilní akční tlačítko), což volá `triggerCasinoProximityAction()`.
- **Slots (`animateSlotReel`, `celebrateSlots`, `spinSlots`, kolem L3848–4020):** Válce používají WAAPI posuv pásu s posledním symbolem shodným s vylosovaným výsledkem, zastavení 600/1100/1600 ms. Při zastavení se animace zruší a DOM nahradí finálním symbolem. Fallback interval smí měnit jen nezastavené válce bez animace; `prefers-reduced-motion` vypíná pohyb i částice. `celebrateSlots` nastavuje stav `#slots-cabinet`, vítězné válce, panel částky a konečný počet částic (12/28), které se odstraní po 2 s. Nový spin resetuje oslavu. Stylování je v `index.html` (prefix `slots-`), žádné změny pravděpodobností ani výplat. Regrese: `node --test test/casino-slots-reels.test.js` ověřuje fallback, animované pásy, 3× hrozny, jackpot, dvě třešně, prohru i reduced motion.

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
