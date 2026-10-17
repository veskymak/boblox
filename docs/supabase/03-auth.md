# Supabase: Autentizace a Uživatelé (Auth)

Supabase obsahuje kompletní systém správy uživatelů: bezpečné hašování hesel, správu JWT tokenů, e-mailové potvrzování, reset hesel a OAuth poskytovatele (Google, Discord, GitHub).

---

## 1. Registrace nového uživatele

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'hrac@example.com',
  password: 'tajneHeslo123!',
  options: {
    data: {
      username: 'HracPepa',
      avatar_url: 'https://example.com/avatar.png'
    }
  }
});

if (error) {
  console.error('Chyba registrace:', error.message);
} else {
  console.log('Uživatel vytvořen:', data.user);
}
```

> [!TIP]
> Pokud máte v Supabase Dashboardu zapnuté "Confirm email", uživatel se bude moci přihlásit až po kliknutí na ověřovací odkaz v emailu. Pro vývoj můžete tuto volbu vypnout v **Authentication** -> **Providers** -> **Email** -> odškrtnout *Confirm email*.

---

## 2. Přihlášení uživatele (Heslo)

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'hrac@example.com',
  password: 'tajneHeslo123!'
});

if (error) {
  alert('Chybné přihlašovací údaje: ' + error.message);
} else {
  console.log('Přihlášený uživatel:', data.user);
  console.log('Aktivní session token:', data.session.access_token);
}
```

---

## 3. Odhlášení

```javascript
const { error } = await supabase.auth.signOut();
if (!error) {
  console.log('Uživatel úspěšně odhlášen.');
}
```

---

## 4. Zjištění aktuálně přihlášeného uživatele

```javascript
// Rychlé zjištění ze session uložené v LocalStorage:
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  console.log('Přihlášen:', session.user);
} else {
  console.log('Nikdo není přihlášen.');
}

// Nebo ověření přímo vůči Supabase Auth serveru:
const { data: { user } } = await supabase.auth.getUser();
```

---

## 5. Naslouchání na změnu stavu přihlášení (Listener)

Supabase automaticky uchovává session v `localStorage` prohlížeče. Pro reakci na přihlášení, odhlášení nebo obnovení tokenu použijte:

```javascript
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  console.log('Změna auth stavu:', event);

  if (event === 'SIGNED_IN') {
    console.log('Uživatel se přihlásil:', session.user);
    aktualizovatUI(session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('Uživatel se odhlásil');
    vycistitUI();
  }
});

// Pro odhlášení listeneru:
// authListener.subscription.unsubscribe();
```

---

## 6. Přihlášení přes OAuth (Google, GitHub, Discord)

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github', // nebo 'google', 'discord'
  options: {
    redirectTo: window.location.origin // Návratová URL zpět na GitHub Pages
  }
});
```

