import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers });
    if (req.method !== 'POST') return new Response('{}', { status: 405, headers });
    const denied = () => new Response(JSON.stringify({ error: 'Neplatné přihlašovací údaje nebo nepotvrzený e-mail.' }), { status: 401, headers });
    try {
        const { username, password } = await req.json();
        if (typeof username !== 'string' || username.length > 254 || typeof password !== 'string' || password.length > 100) return denied();
        const url = Deno.env.get('SUPABASE_URL')!;
        const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
        const auth = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
        let email = username.trim().toLowerCase();
        if (!email.includes('@')) {
            const { data, error } = await admin.rpc('account_login_email', { login_name: email });
            if (error) return denied();
            // Unknown names still go through Auth password verification; never return the resolved email.
            email = data || email + '@boblox.cz';
        }
        const { data, error } = await auth.auth.signInWithPassword({ email, password });
        if (error || !data.session) return denied();
        return new Response(JSON.stringify({ session: data.session }), { headers });
    } catch {
        return denied();
    }
});
