# SoundEngine.js - AI Context

## 1. Quick Summary (TL;DR)
`src/core/SoundEngine.js` poskytuje procedurální syntezátor zvukových efektů postavený na standardním Web Audio API (`BobloxSoundEngine`), který generuje všechny herní zvuky (Oof, skok, seknutí mečem, výstřel z blasteru, exploze, fanfáry, cinknutí mincí, zvuky kasína) bez nutnosti stahování externích audio souborů, a současně řídí streamování hudební kulisy pro kasíno s ovládáním hlasitosti a ztlumení.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a exportuje globálně:**
  - `sfx` (`BobloxSoundEngine`): Jediný globální singleton zvukového enginu pro celou aplikaci.
  - `DEFAULT_CASINO_MUSIC_VOLUME`: Výchozí hlasitost hudby (0.35 = 35 %).
  - `CASINO_MUSIC_TRACK_URL`: Cesta k audiotracku kasína (`'https://icecast4.play.cz/kiss128.mp3'`).
- **Interní stav v instanci `sfx`:**
  - `this.ctx`: Instance `AudioContext` (líně inicializovaná při první interakci uživatele).
  - `this.muted`: Boolean příznak ztlumení všech efektů (SFX).
  - `this.musicMuted`: Boolean příznak ztlumení hudby (BGM).
  - `this.musicVolume`: Aktuální úroveň hlasitosti hudby (0.0 až 1.0).
  - `this.musicAudio`: Instance `HTMLAudioElement` pro smyčku hudby kasína.

---

## 3. Key API Functions & Signatures
- `sfx.playOof(): void`
  - Ikonický Roblox zvuk zranění/smrti (rychlý frekvenční pokles oscilátoru).
- `sfx.playJump(): void`
  - Frekvenční vzestupný skluz pro odraz hráče od země.
- `sfx.playCoin(): void`
  - Dvojtónové vysoké cinknutí při sebrání mince, nákupu nebo odměně.
- `sfx.playSword(): void`
  - Bílý šum prohnaný pásmovou propustí simulující máchnutí mečem.
- `sfx.playLaser(): void`
  - Rychlý klesající tón laserového výstřelu.
- `sfx.playExplosion(): void`
  - Hluboký dunivý filtr šumu simulující výbuch (raketomet, meteor).
- `sfx.playFanfare(): void`
  - Vítězná arpeggio melodie (dokončení obby, výhra, admin broadcast).
- `sfx.playClick(): void`
  - Krátký tichý impuls při stisku tlačítek v UI.
- `sfx.playError(): void`
  - Hluboký bzučivý tón při neplatné akci nebo nedostatku Bobuxů.
- `sfx.playCasinoSpin()` / `sfx.playCasinoWin(): void`
  - Tikání kola štěstí / fanfára výhry na automatech.
- `sfx.enterCasino()` / `sfx.stopMusic(): void`
  - Spustí nebo zastaví přehrávání hudební kulisy v kasínu.
- `toggleAudioMute(): boolean` / `toggleMusicMute(): boolean`
  - Přepíná globální ztlumení zvuků nebo hudby.
- `setMusicVolumeFromUI(val: number): void`
  - Nastaví hlasitost hudby (0 až 100 %).

---

## 4. Lifecycle & Execution Hooks
- **První interakce uživatele:** Jakékoliv kliknutí v aplikaci aktivuje `sfx.ensureAudioContext()`, čímž se vyhoví restrikcím prohlížečů pro autoplay audia.
- **Herní události:**
  - `damagePlayer()` -> `sfx.playOof()`
  - Skok hráče -> `sfx.playJump()`
  - Útok zbraní -> `sfx.playSword()` nebo `sfx.playLaser()`
  - Admin broadcast -> `sfx.playFanfare()`
- **Vstup a odchod z kasína:** `setupGame12Casino()` spustí `sfx.enterCasino()`, zatímco `cleanupCurrentGame()` spolehlivě volá `sfx.stopMusic()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **NIKDY nevytvářej nový `new AudioContext()` ani `new Audio()` v minihrách**: Vždy volej metody existujícího singletonu `sfx`.
- **Pozor na Autoplay Policy**: Zvuky nesmí být volány předtím, než uživatel provedl alespoň jedno kliknutí do okna. Metoda `ensureAudioContext()` to řeší automaticky, pokud používáš API `sfx`.
- **Při opuštění hry VŽDY zastav hudbu**: `cleanupCurrentGame()` v `Engine.js` to provádí, ale pokud vytváříš novou minihru s hudbou, nezapomeň ji zastavit.

---


Radio starts off on every entry. Only the radio button enables streaming. Station changes release the previous audio element. Mute, zero volume and exit pause, detach src and load before dropping the element.
