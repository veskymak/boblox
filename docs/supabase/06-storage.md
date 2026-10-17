# Supabase: Úložiště souborů (Storage)

Supabase Storage slouží k nahrávání a stahování velkých binárních souborů, jako jsou avatary, screenshoty, herní mapy nebo zvukové efekty.

---

## 1. Vytvoření Bucket (Kbelíku)

1. V Supabase Dashboardu otevřete sekci **Storage**.
2. Klikněte na **New bucket**.
3. Zadejte název (např. `avatars` nebo `game-assets`).
4. Zvolte, zda má být bucket **Public** (veřejně čitelný přes URL bez tokenu) nebo **Private**.
5. Klikněte na **Save**.

---

## 2. Nahrání souboru (Upload)

```javascript
// Příklad s prvkem <input type="file" id="fileInput">
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

// Cesta v kbelíku (např. avatars/user_123.png)
const filePath = `user_${Date.now()}.${file.name.split('.').pop()}`;

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true // Povolit přepsání existujícího souboru se stejným názvem
  });

if (error) {
  console.error('Chyba při nahrávání:', error.message);
} else {
  console.log('Soubor nahrán:', data.path);
}
```

---

## 3. Získání veřejné URL adresy souboru

Pro veřejné (Public) buckety:

```javascript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user_123.png');

console.log('Odkaz na obrázek:', data.publicUrl);
// data.publicUrl lze přímo přiřadit do <img src="...">
```

---

## 4. Stažení souboru z privátního bucketu

```javascript
const { data, error } = await supabase.storage
  .from('private-saves')
  .download('savegame_01.dat');

if (data) {
  const text = await data.text(); // nebo data.arrayBuffer()
  console.log('Obsah souboru:', text);
}
```

---

## 5. Smazání souboru

```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .remove(['user_123.png']);
```

