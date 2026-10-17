# GitHub Pages: Začínáme (Getting Started)

GitHub Pages je bezplatná služba pro statický webhosting přímo z repozitáře na GitHubu. Umožňuje hostovat HTML, CSS, JavaScript a statické soubory.

---

## 1. Typy stránek

1. **Uživatelská / Organizační stránka**
   - Název repozitáře: `<username>.github.io`
   - URL webu: `https://<username>.github.io/`
   - Hostuje se z hlavní větve (`main`).

2. **Projektová stránka**
   - Název repozitáře: libovolný (např. `boblox`)
   - URL webu: `https://<username>.github.io/boblox/`
   - Může se publikovat z kořene `/` nebo ze složky `/docs`.

---

## 2. Doporučená struktura souborů

Pro přímé spuštění musí repozitář obsahovat vstupní soubor `index.html`:

```text
boblox/
├── index.html           # Hlavní vstupní bod aplikace
├── style.css            # Styly (volitelné)
├── app.js               # Klientská logika (volitelné)
├── assets/              # Obrázky, zvuky, ikony
│   ├── favicon.ico
│   └── logo.png
└── .nojekyll            # Zabraňuje ignorování složek začínajících podtržítkem
```

> [!IMPORTANT]
> Pokud váš projekt neobsahuje statický `index.html` v kořenu nebo ve vybrané složce, GitHub Pages vrátí chybu 404.

---

## 3. Postup aktivace GitHub Pages

1. Otevřete svůj repozitář na GitHubu.
2. Přejděte do **Settings** (Nastavení).
3. V levém menu klikněte na **Pages** (v sekci *Code and automation*).
4. V sekci **Build and deployment** nastavte:
   - **Source:** `Deploy from a branch`
   - **Branch:** vyberte větev (obvykle `main`)
   - **Folder:** `/ (root)` nebo `/docs`
5. Klikněte na tlačítko **Save**.
6. Počkejte 1–3 minuty. Nahoře se objeví zelená hláška s odkazem:
   `Your site is live at https://<username>.github.io/<repo-name>/`

---

## 4. Soubor `.nojekyll`

GitHub Pages ve výchozím nastavení zpracovává weby pomocí nástroje Jekyll. Jekyll však ignoruje soubory a složky, které začínají podtržítkem `_` (např. `_next`, `_nuxt` apod.).

Aby se tomuto chování předešlo, doporučuje se vytvořit prázdný soubor s názvem `.nojekyll` v kořenovém adresáři repozitáře:

```bash
touch .nojekyll
git add .nojekyll
git commit -m "Add .nojekyll"
git push
```

