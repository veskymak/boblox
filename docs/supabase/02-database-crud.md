# Supabase: Práce s databází (CRUD)

Supabase používá pod kapotou plnohodnotný PostgreSQL a vystavuje automatické REST API (PostgREST). Veškeré operace můžete volat přímo z JavaScriptu.

---

## 1. Čtení dat (SELECT)

### Základní výběr všech řádků a sloupců
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Výběr konkrétních sloupců
```javascript
const { data, error } = await supabase
  .from('users')
  .select('id, username, score');
```

### Filtrování dat
```javascript
const { data, error } = await supabase
  .from('users')
  .select('id, username, score')
  .eq('username', 'pepa')             // username == 'pepa'
  .gte('score', 100)                 // score >= 100
  .order('score', { ascending: false }) // řazení sestupně
  .limit(10);                        // prvních 10 záznamů
```

### Načtení jednoho konkrétního řádku
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 42)
  .single(); // Vrátí přímo objekt místo pole
```

---

## 2. Vkládání dat (INSERT)

### Vložení jednoho řádku
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    { username: 'novy_hrac', score: 0, coins: 50 }
  ])
  .select(); // .select() vrátí nově vložený řádek včetně vygenerovaného ID
```

### Hromadné vložení více řádků
```javascript
const { data, error } = await supabase
  .from('items')
  .insert([
    { name: 'Meč', price: 100 },
    { name: 'Štít', price: 150 },
    { name: 'Lektvar', price: 25 }
  ]);
```

---

## 3. Úprava dat (UPDATE)

```javascript
const { data, error } = await supabase
  .from('users')
  .update({ score: 250, coins: 120 })
  .eq('id', 42)
  .select();
```

---

## 4. Upsert (Vložit nebo Aktualizovat)

Pokud záznam s daným unikátním klíčem existuje, upraví se, jinak se vytvoří nový:

```javascript
const { data, error } = await supabase
  .from('user_stats')
  .upsert({ user_id: 42, games_played: 15 }, { onConflict: 'user_id' })
  .select();
```

---

## 5. Mazání dat (DELETE)

```javascript
const { data, error } = await supabase
  .from('sessions')
  .delete()
  .eq('user_id', 42);
```

---

## 6. Přehled běžných filtrů

| Metoda | Popis | Příklad |
| :--- | :--- | :--- |
| `.eq(col, val)` | Rovná se (`=`) | `.eq('status', 'online')` |
| `.neq(col, val)` | Nerovná se (`!=`) | `.neq('status', 'banned')` |
| `.gt(col, val)` | Větší než (`>`) | `.gt('coins', 0)` |
| `.gte(col, val)` | Větší nebo rovno (`>=`) | `.gte('level', 5)` |
| `.lt(col, val)` | Menší než (`<`) | `.lt('price', 1000)` |
| `.lte(col, val)` | Menší nebo rovno (`<=`) | `.lte('price', 500)` |
| `.like(col, pattern)` | Textová shoda (citlivé na velikost písmen) | `.like('name', '%meč%')` |
| `.ilike(col, pattern)` | Textová shoda (necitlivé na velikost písmen) | `.ilike('name', '%meč%')` |
| `.in(col, array)` | Hodnota je v poli | `.in('role', ['admin', 'moderator'])` |
| `.is(col, null)` | Test na `NULL` nebo `boolean` | `.is('deleted_at', null)` |

---

## 7. Volání vlastních PostgreSQL funkcí (RPC)

V Supabase můžete v SQL editoru vytvořit uloženou proceduru / funkci a zavolat ji z JavaScriptu:

```javascript
const { data, error } = await supabase.rpc('pridat_skore', {
  user_id_param: 42,
  amount: 50
});
```

