# Supabase: Edge Functions (Serverless kód)

Když hostujete web na GitHub Pages, nemáte vlastní Node.js server. Pokud potřebujete provést operaci, která vyžaduje tajný klíč (např. Stripe platby, komunikace s OpenAI API, odesílání emailů nebo ověřování herních cheatů), použijte **Supabase Edge Functions**.

Edge Functions běží na platformě Deno po celém světě s minimální latencí.

---

## 1. Instalace Supabase CLI

Pro psaní a nasazení Edge funkcí se používá lokální Supabase CLI:

```bash
# Instalace přes npm
npm install supabase --save-dev

# Přihlášení do Supabase účtu
npx supabase login

# Inicializace projektu
npx supabase init
```

---

## 2. Vytvoření nové funkce

```bash
npx supabase functions new payment-checkout
```

Vznikne soubor `supabase/functions/payment-checkout/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Ošetření CORS OPTIONS preflight požadavku
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { itemId, amount } = await req.json();

    // Zde běží bezpečný kód se serverovým klíčem
    console.log(`Zpracovávám položku ${itemId} s částkou ${amount}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Operace dokončena' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

---

## 3. Nasazení funkce (Deploy)

```bash
# Propojení s vaším cloudovým projektem (project ref najdete v URL projektu)
npx supabase link --project-ref vase-id-projektu

# Nasazení funkce
npx supabase functions deploy payment-checkout
```

---

## 4. Zavolání funkce z vašeho frontendu (GitHub Pages)

Ve vašem `index.html` nebo klientském skriptu stačí zavolat `supabase.functions.invoke`:

```javascript
const { data, error } = await supabase.functions.invoke('payment-checkout', {
  body: { itemId: 'sword_01', amount: 100 }
});

if (error) {
  console.error('Chyba volání Edge funkce:', error);
} else {
  console.log('Výsledek z Edge funkce:', data);
}
```

