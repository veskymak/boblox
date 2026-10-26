# SoundEngine.js - AI Context

## 1. Quick Summary (TL;DR)
`src/core/SoundEngine.js` poskytuje procedurální syntezátor zvukových efektů postavený na standardním Web Audio API (`BobloxSoundEngine`), který generuje všechny herní zvuky (Oof, skok, seknutí mečem, výstřel z blasteru, exploze, fanfáry, cinknutí mincí, zvuky kasína) bez nutnosti stahování externích audio souborů, a současně řídí streamování hudební kulisy pro kasíno s ovládáním hlasitosti a ztlumení.

---

## 2. Global State & Single Source of Truth (SSOT)
- **Vlastní a exportuje globálně:**
  - `sfx` (`BobloxSoundEngine`): Jediný globální singleton zvukového enginu pro celou aplikaci.
  - `DEFAULT_CASINO_MUSIC_VOLUME`: Výchozí hlasitost hudby (0.35 = 35 %).
  - `CASINO_MUSIC_TRACK_URL`: Cesta k audiotracku kasína (`'assets/audio/casino_bgm.mp3'`).
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
- `sfx.playCasinoMusic()` / `sfx.stopCasinoMusic(): void`
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
- **Vstup a odchod z kasína:** `setupGame12Casino()` spustí `sfx.playCasinoMusic()`, zatímco `cleanupCurrentGame()` spolehlivě volá `sfx.stopCasinoMusic()`.

---

## 5. Anti-Duplication Rules & Gotchas
- **NIKDY nevytvářej nový `new AudioContext()` ani `new Audio()` v minihrách**: Vždy volej metody existujícího singletonu `sfx`.
- **Pozor na Autoplay Policy**: Zvuky nesmí být volány předtím, než uživatel provedl alespoň jedno kliknutí do okna. Metoda `ensureAudioContext()` to řeší automaticky, pokud používáš API `sfx`.
- **Při opuštění hry VŽDY zastav hudbu**: `cleanupCurrentGame()` v `Engine.js` to provádí, ale pokud vytváříš novou minihru s hudbou, nezapomeň ji zastavit.

---

## 6. Code Snippets / Seams

### Seam A: Singleton zvuku a líná inicializace kontextu
```javascript
// src/core/SoundEngine.js: L463-L470
const sfx = new BobloxSoundEngine();
// uvnitř třídy:
if (this.ctx && this.ctx.state === 'suspended') { this.ctx.resume(); }
```

### Seam B: Syntéza klasického zvuku Oof
```javascript
// src/core/SoundEngine.js: L125-L135
playOof() {
    if (this.muted || !this.ensureAudioContext()) return;
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);
```

### Seam C: Spuštění kasínové hudby
```javascript
// src/core/SoundEngine.js: L430-L440
playCasinoMusic() {
    if (!this.musicAudio) { this.musicAudio = new Audio(CASINO_MUSIC_TRACK_URL); this.musicAudio.loop = true; }
    this.musicAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    this.musicAudio.play().catch(() => {});
}
```
