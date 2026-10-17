# Supabase: Realtime (WebSockets)

Funkce Realtime umožňuje aplikaci okamžitě reagovat na změny v databázi (např. chat, multiplayer aktualizace pozic hráčů, online seznam uživatelů) přes WebSockets bez nutnosti neustálého dotazování (polling).

---

## 1. Povolení Realtime pro tabulku

1. V Supabase Dashboardu přejděte do **Database** -> **Replication**.
2. Klikněte na položku `supabase_realtime`.
3. Přepněte přepínač u tabulky, kterou chcete sledovat (např. `messages`, `game_rooms`).

Nebo v SQL Editoru:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

---

## 2. Naslouchání na změny v databázi (Postgres Changes)

### Sledování všech vložení (INSERT) v tabulce
```javascript
const channel = supabase
  .channel('verejny-chat')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('Přišla nová zpráva:', payload.new);
      pridatZpravuDoUI(payload.new);
    }
  )
  .subscribe((status) => {
    console.log('Realtime stav:', status);
  });
```

### Sledování všech událostí (INSERT, UPDATE, DELETE)
```javascript
const roomChannel = supabase
  .channel('room-updates')
  .on(
    'postgres_changes',
    {
      event: '*', // libovolná změna
      schema: 'public',
      table: 'game_rooms',
      filter: 'room_id=eq.101' // sledovat pouze konkrétní místnost
    },
    (payload) => {
      console.log('Změna místnosti:', payload);
    }
  )
  .subscribe();
```

---

## 3. Broadcast (Rychlé posílání zpráv klient -> klient bez zápisu do DB)

Ideální pro pohyb kurzoru, hráčů nebo rychlé herní signály:

```javascript
// 1. Odběr broadcastu
const gameChannel = supabase.channel('herni-plocha');

gameChannel.on('broadcast', { event: 'player-move' }, ({ payload }) => {
  console.log(`Hráč ${payload.playerId} je na pozici:`, payload.x, payload.y);
  aktualizovatHrace(payload);
});

gameChannel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // 2. Odeslání pozice ostatním
    gameChannel.send({
      type: 'broadcast',
      event: 'player-move',
      payload: { playerId: 'user1', x: 120, y: 350 }
    });
  }
});
```

---

## 4. Presence (Kdo je právě online)

Sledování připojených uživatelů a jejich stavu:

```javascript
const presenceChannel = supabase.channel('online-hraci');

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const newState = presenceChannel.presenceState();
    console.log('Aktuálně online hráči:', newState);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('Připojil se:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('Odpojil se:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user: 'Pepa',
        online_at: new Date().toISOString()
      });
    }
  });
```

---

## 5. Ukončení spojení

Když uživatel opustí stránku nebo místnost:
```javascript
supabase.removeChannel(channel);
```

