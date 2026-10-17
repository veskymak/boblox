# GitHub Pages: Automatické nasazení pomocí GitHub Actions

Kromě standardního publikování z větve můžete použít **GitHub Actions** pro automatické nasazení při každém `git push` do větve `main`.

---

## 1. Nastavení v repozitáři

1. V GitHub repozitáři otevřete **Settings** -> **Pages**.
2. V sekci **Build and deployment** přepněte **Source** na:
   `GitHub Actions`.

---

## 2. Vytvoření Workflow souboru

Vytvořte soubor `.github/workflows/deploy.yml` v kořenovém adresáři vašeho projektu:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

  # Umožňuje ruční spuštění z GitHub UI (záložka Actions)
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout kódu
        uses: actions/checkout@v4

      - name: Nastavení GitHub Pages
        uses: actions/configure-pages@v5

      - name: Nahrání statických souborů
        uses: actions/upload-pages-artifact@v3
        with:
          # Cesta k publikovaným souborům (tečka = celý repozitář, nebo např. dist/)
          path: '.'

      - name: Nasazení na GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. Výhody tohoto přístupu
- Nemusíte vytvářet speciální `gh-pages` větev.
- Můžete před nasazením spustit testy nebo minifikaci.
- Přehledná historie každého nasazení přímo v záložce **Actions**.

