# Boblox AI Context Layer - Central Index (llms.txt)

Tento rozcestník slouží pro AI agenty k okamžité orientaci v architektuře Boblox bez nutnosti procházet 18 000+ řádků zdrojového kódu.

## 🧭 Rychlá navigace podle domény

Adopt Me GUI, sbírka, atlas a navigace: [AdoptMeUI.md](AdoptMeUI.md) (`src/ui/AdoptMeUI.js`).

| Doména / Co řešíš? | Soubor kódu | AI Context dokument |
|---|---|---|
| **Fyzika, kolize, herní smyčka, animace ticku** | `src/core/PhysicsAndLoop.js` | [PhysicsAndLoop.md](PhysicsAndLoop.md) |
| **Multiplayer, WebRTC PeerJS, WebSockets, Presence** | `src/network/NetworkManager.js` | [NetworkManager.md](NetworkManager.md) |
| **Three.js scéna, kamera, zbraně, správa životů** | `src/core/Engine.js` | [Engine.md](Engine.md) |
| **Klávesnice, myš, PointerLock, mobilní joystick, boot** | `src/core/InputManager.js` | [InputManager.md](InputManager.md) |
| **Avatary, 3D panáčci, skiny, shop, Roblox bubliny** | `src/core/AvatarAndShop.js` | [AvatarAndShop.md](AvatarAndShop.md) |
| **Zvukové efekty Web Audio, hudba, hlasitost** | `src/core/SoundEngine.js` | [SoundEngine.md](SoundEngine.md) |
| **Logika 12 miniher (Obby, SFOTH, Tycoon, Casino...)** | `src/games/GameWorlds.js` | [GameWorlds.md](GameWorlds.md) |
| **Auth, JWT, Bobux ekonomika, Supabase, sync, apiRequest** | `src/state/PortalStore.js` | [PortalStore.md](PortalStore.md) |
| **Portál UI, Roblox ESC menu, chat, přátelé, profil** | `src/ui/PortalUI.js` | [PortalUI.md](PortalUI.md) |
| **Administrátorský panel, cheaty, dávání Bobuxů, bcast** | `src/ui/AdminUI.js` | [AdminUI.md](AdminUI.md) |
| **Backend Node.js, Express, SQLite, WS server** | `server.js` | [Server.md](Server.md) |

---

## ⚡ Pokyny pro AI Agenty (Instrukce na začátku session)
1. **Nenačítej celý adresář `src/`!** Identifikuj z tabulky výše 1–2 relevantní dokumenty a přečti si jejich shrnutí v `docs/ai_context/<nazev>.md`.
2. **Respektuj Single Source of Truth (SSOT)**: Každý modul má pevně daného vlastníka stavu popsaného v sekci 2 každého dokumentu.
3. **Self-Maintaining Protocol**: Pokud upravíš jakýkoliv soubor v `src/` nebo `server.js`, **tvojí povinností v téže odpovědi** je aktualizovat odpovídající `.md` dokument v `docs/ai_context/`.
