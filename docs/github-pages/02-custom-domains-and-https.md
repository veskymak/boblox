# GitHub Pages: Vlastní doména a HTTPS

GitHub Pages umožňuje bezplatně napojit vlastní doménu (např. `boblox.cz` nebo `www.boblox.cz`) včetně automatického vystavení SSL certifikátu (HTTPS).

---

## 1. Soubor CNAME v repozitáři

Pro nastavení vlastní domény vytvořte v kořenovém adresáři soubor s názvem `CNAME` (bez přípony).

Obsah souboru:
```text
boblox.mojedomena.cz
```
*(nebo pouze vaše hlavní doména, např. `mojedomena.cz`)*.

---

## 2. Nastavení DNS záznamů u registrátora

Přihlaste se do správy své domény (Wedos, Forpsi, Cloudflare, Active24, GoDaddy apod.) a přidejte odpovídající DNS záznamy.

### Varianta A: Subdoména (např. `www` nebo `hra`)
Nastavte **CNAME** záznam:
| Typ | Název (Host) | Hodnota (Cíl) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `<username>.github.io.` | 3600 (nebo auto) |

### Varianta B: Hlavní (Apex / Root) doména (např. `mojedomena.cz`)
Nastavte **A** záznamy směřující na oficiální IP adresy GitHub Pages:
| Typ | Název (Host) | Hodnota (IP adresa) |
| :--- | :--- | :--- |
| **A** | `@` | `185.199.108.153` |
| **A** | `@` | `185.199.109.153` |
| **A** | `@` | `185.199.110.153` |
| **A** | `@` | `185.199.111.153` |

Volitelně můžete přidat i odpovídající AAAA (IPv6) záznamy:
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

---

## 3. Nastavení v GitHub repozitáři

1. V GitHub repozitáři přejděte do **Settings** -> **Pages**.
2. V sekci **Custom domain** zadejte svou doménu (např. `www.mojedomena.cz`).
3. Klikněte na **Save**. GitHub zkontroluje DNS záznamy.
4. Zaškrtněte volbu **Enforce HTTPS**.
   - *Poznámka:* Generování certifikátu Let's Encrypt obvykle trvá 5 až 30 minut po ověření DNS.

