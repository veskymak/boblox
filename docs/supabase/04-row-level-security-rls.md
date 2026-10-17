# Supabase: Zabezpečení dat pomocí RLS (Row Level Security)

V tradičních architekturách chrání databázi serverový backend (např. Express.js). Při architektuře **GitHub Pages + Supabase** však klientský JavaScript komunikuje přímo s databází přes veřejný `anon` klíč.

Bezpečnost v Supabase zajišťuje PostgreSQL funkce **Row Level Security (RLS)** – pravidla definovaná přímo v databázi, která určují, kdo smí číst, vkládat, upravovat nebo mazat jednotlivé řádky.

---

## 1. Zapnutí RLS na tabulce

Ve výchozím stavu nebo po vytvoření tabulky musíte RLS povolit v SQL editoru nebo v Table Editoru:

```sql
-- Zapnutí RLS na tabulce 'profiles'
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

> [!WARNING]
> Pokud zapnete RLS a nevytvoříte žádné pravidlo (Policy), tabulka bude kompletně uzamčena pro všechny klienty s `anon` klíčem (vrátí 0 řádků).

---

## 2. Příklady běžných RLS politik (Policies)

### A. Veřejné čtení pro kohokoliv (Public Read)
Vhodné pro žebříčky skóre, katalog předmětů apod.

```sql
CREATE POLICY "Kdokoli může číst profily"
ON profiles
FOR SELECT
TO anon, authenticated
USING (true);
```

### B. Uživatel může upravovat pouze svůj vlastní záznam
Používá se funkce `auth.uid()`, která vrací ID právě přihlášeného uživatele z jeho JWT tokenu:

```sql
CREATE POLICY "Uživatelé mohou upravovat pouze svůj profil"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### C. Uživatel může vkládat data pouze za sebe
```sql
CREATE POLICY "Uživatelé mohou vytvořit svůj záznam"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### D. Pouze přihlášení uživatelé mohou mazat své zprávy
```sql
CREATE POLICY "Smazat vlastní zprávy"
ON messages
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);
```

---

## 3. Otestování RLS pravidel

Když zavoláte ze svého JavaScriptu:
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ score: 999999 })
  .eq('id', 'id-jineho-uzivatele');
```
PostgreSQL požadavek tiše odfiltruje (žádný řádek se nezmění) nebo vrátí chybu v závislosti na operaci. Nikdo nemůže podvrhnout cizí data ani při manipulaci s klientským kódem v DevTools!

