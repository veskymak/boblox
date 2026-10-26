# AvatarAndShop.js - AI Context

## 1. Quick Summary (TL;DR)
`src/core/AvatarAndShop.js` vytváří a spravuje 3D blokové postavičky ve stylu Robloxu (trup, hlava, končetiny, doplňky, socket pro zbraně), řídí šatník hráče a ekonomiku obchodu (nákupy za Bobuxy, vybavování doplňků, ukládání outfitu), vykresluje 2D portréty avatarů pro UI a generuje 3D Roblox komiksové chatovací bubliny plovoucí nad hlavami hráčů.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a spravuje:**
  - `SHOP_ITEMS`: Kompletní katalog nabízeného zboží (trička, kalhoty, obličeje, klobouky) s cenami a vizuálními daty.
  - `SHOP_ITEM_MAP`: Rychlý vyhledávací slovník `{ id -> itemDef }`.
  - `TORSO_COLORS`: Paleta dostupných barev trupu/kůže.
  - `ownedShopItems` (`Set`): Množina vlastněných ID předmětů lokálního hráče.
  - `avatarOutfit`: Aktuálně nasazený outfit `{ shirt, pants, face, hat }`.
  - `shopState`: Stav UI obchodu (zvolená kategorie, vybraný předmět, zkoušený outfit v náhledu).
  - `avatarHeadshotCache`: Mezipaměť vygenerovaných 2D portrétů (`dataURL`) pro rychlé zobrazení v UI.
  - `ROBLOX_MAX_CHAT_BUBBLES`: Limit maximálně 3 souběžných bublin nad jednou postavou.
- **Čte a volá:**
  - `bobuxBalance`, `spendBobux()`: Pro validaci a stržení částky při nákupu.
  - `avatarTorsoHex`: Pro podkladovou barvu kůže při generování textur.
  - `syncAccountToServer()`: Pro trvalé uložení zakoupených předmětů a outfitu na backend/cloud.

---

## 3. Key API Functions & Signatures
- `createBlockyCharacterMesh(options?: Object): Object`
  - Sestaví kompletní 3D hierarchii panáčka (trup, hlava s obličejovou texturou, končetiny, kloboukový socket, socket pro zbraně a skupinu pro Roblox forcefield štít). Vrací objekt s referencemi na jednotlivé části.
- `getAvatarHeadshotDataUrl(outfit: Object, torsoHex: string): string`
  - Vykreslí 2D plátnem Roblox portrét hlavy se správným obličejem a čepicí a vrátí `data:image/png;base64,...` URL. Výsledek cachuje.
- `invalidateAvatarHeadshotCache(): void`
  - Smaže mezipaměť portrétů. Povinné volat po každé změně outfitu nebo barvy avatara.
- `openShopModal(category?: string): void`
  - Otevře okno obchodu s avatary a spustí rotující 3D náhledovou smyčku `shopPreviewLoop`.
- `closeShopModal(): void`
  - Zavře okno obchodu a korektně uvolní 3D zdroje náhledové scény.
- `buyShopItem(id: string): void`
  - Zkontroluje zůstatek Bobuxů, strhne cenu přes `spendBobux()`, přidá ID do `ownedShopItems`, uloží do LocalStorage a asynchronně synchronizuje na server.
- `equipShopItem(id: string): void`
  - Nasadí předmět do příslušného slotu (`shirt`, `pants`, `face`, `hat`), invaliduje cache portrétu, překreslí postavu a vyvolá synchronizaci na backend.
- `spawnChatBubbleOnAvatar(avatarObj: Object, rawText: string, isSelf?: boolean): void`
  - Vygeneruje nad hlavou zadaného avatara 3D billboard sprite s textem zprávy a ocasem bubliny ve stylu Robloxu.
- `updateAvatarChatBubbles(avatarObj: Object, dt: number): void`
  - Posouvá bubliny vzhůru a po uplynutí doby životnosti zajišťuje jejich plynulý fade-out a uvolnění z paměti.

---

## 4. Lifecycle & Execution Hooks
- **Vytvoření postavy:** Při startu hry (`Engine.js` -> `playerAvatar`) a při příchodu cizího hráče (`NetworkManager.js` -> `remotePlayers`).
- **Smyčka náhledu v obchodě:** Vlastní lehká animace `shopPreviewLoop(now)` běžící pouze po dobu otevření okna obchodu.
- **Render smyčka hry (`gameLoop`):** Volá `updateAvatarChatBubbles(playerAvatar, dt)` a totéž pro všechny vzdálené hráče.
- **Přijetí chat zprávy:** Událost vyvolá `spawnChatBubbleOnAvatar()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **NIKDY nesestavuj vlastní 3D model hráče ručně v minihrách**: Vždy použij `createBlockyCharacterMesh()`.
- **NIKDY neupravuj `avatarOutfit` bez invalidace portrétu**: Jakákoliv změna skinu musí být doprovázena voláním `invalidateAvatarHeadshotCache()`, jinak se v UI profilu a ESC menu zobrazí starý vzhled.
- **Správa 3D zdrojů (Disposal)**: Při výměně čepic nebo zkoušení v obchodě vždy uvolni starou geometrii a materiál pomocí `disposeObject3D()`, aby nedocházelo k únikům paměti WebGL.
- **ZÁKAZ vlastních textových štítků v canvasu minihry**: Pro text nad hlavou používej výhradně `spawnChatBubbleOnAvatar()`.

---

## 6. Code Snippets / Seams

### Seam A: Továrna na Roblox postavu
```javascript
// src/core/AvatarAndShop.js: L120-L135
function createBlockyCharacterMesh(options = {}) {
    const group = new THREE.Group();
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    const head = new THREE.Mesh(headGeo, headMat);
    // sestavuje klouby ramen, nohou, hatSocket a toolSocket
```

### Seam B: Vybavení předmětu a uložení outfitu
```javascript
// src/core/AvatarAndShop.js: L1310-L1325
function equipShopItem(id) {
    const item = SHOP_ITEM_MAP[id];
    avatarOutfit[item.slot] = id;
    saveShopState();
    invalidateAvatarHeadshotCache();
    if (typeof syncAccountToServer === 'function') syncAccountToServer();
}
```

### Seam C: Vytvoření 3D bubliny chatu nad postavou
```javascript
// src/core/AvatarAndShop.js: L1730-L1745
function spawnChatBubbleOnAvatar(avatarObj, rawText, isSelf = true) {
    const sprite = createRobloxBubbleSprite(rawText, true);
    avatarObj.bubbleGroup.add(sprite);
    recomputeAvatarBubbleStackTargets(avatarObj);
}
```
