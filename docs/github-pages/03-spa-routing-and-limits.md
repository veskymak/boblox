# GitHub Pages: SPA Routing a Limity

GitHub Pages je výhradně statický webový server. Neumožňuje spouštět Node.js, PHP, Python ani lokální databáze (SQLite, MySQL apod.).

---

## 1. Technické limity služby

- **Velikost repozitáře:** Doporučeno do 1 GB (tvrdý limit 5 GB).
- **Měsíční přenos dat (Bandwidth):** 100 GB za měsíc.
- **Frekvence sestavování:** Maximálně 10 sestavení za hodinu.
- **Pouze statický obsah:** Žádný serverový kód (backend) na straně GitHubu. Všechny dynamické funkce (databáze, přihlašování) se musí volat přes externí API (např. **Supabase**).

---

## 2. Řešení pro Single Page Applications (SPA) & Routing

Pokud vaše aplikace používá klientské směrování (History API: `/login`, `/dashboard`, `/game/123`), při přímém načtení nebo obnovení stránky vrátí GitHub Pages standardní chybu `404 Not Found`, protože fyzický soubor neexistuje.

### Řešení A: Hash Routing (nejjednodušší)
Místo běžných URL cest používejte hash v URL:
`https://username.github.io/boblox/#/game`
`https://username.github.io/boblox/#/login`

Prohlížeč nikdy nepošle část za `#` serveru, takže GitHub Pages vždy vrátí kořenový `index.html`.

### Řešení B: Vlastní `404.html` redirect trik
Vytvořte soubor `404.html`, který zachytí požadavek a přesměruje ho zpět na `index.html` s předáním cesty jako parametru:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Přesměrování...</title>
    <script>
      // Uloží původní cestu a přesměruje na index.html
      const segmentCount = 1; // 1 pokud je projekt v podsložce (/boblox/)
      const pathSegments = location.pathname.split('/').slice(1, 1 + segmentCount);
      const redirectPath = location.pathname.slice(pathSegments.join('/').length + 1) + location.search + location.hash;
      sessionStorage.setItem('redirect', redirectPath);
      location.replace('/' + pathSegments.join('/') + '/');
    </script>
  </head>
  <body></body>
</html>
```

V `index.html` pak stačí zkontrolovat `sessionStorage.getItem('redirect')` a obnovit stav aplikace.

