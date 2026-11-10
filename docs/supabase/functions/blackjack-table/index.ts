import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { advanceTable, validateRoom, changedTable, persistableTable } from './table.mjs';

const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {headers,status});
Deno.serve(async req => {
    if (req.method === 'OPTIONS') return new Response(null,{headers});
    if (req.method !== 'POST') return reply({},405);
    try {
        const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false}});
        const token = req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
        if (!token) return reply({},401);
        const {data:{user}} = await db.auth.getUser(token);
        if (!user) return reply({},401);
        const input = await req.json();
        validateRoom(input.room);
        for (let n = 0; n < 4; n++) {
            const {data, error} = await db.rpc('blackjack_table_read',{room_key:input.room, actor:user.id});
            if (error || !data) throw Error('Stůl není dostupný.');
            const {state,changes,view} = advanceTable(data.state,data.actor,input,Date.now());
            if (changedTable(data.state,state)) {
                const saved = await db.rpc('blackjack_table_commit',{room_key:input.room,expected_version:data.version,table_state:persistableTable(state,data.actor,view.now),deltas:changes});
                if (saved.error) throw Error('Změnu stolu se nepodařilo uložit.');
                if (!saved.data) continue;
            }
            return reply({...view, balance:data.actor.coins + (changes[user.id] || 0)});
        }
        return reply({error:'Stůl se změnil. Zkus tah znovu.'},409);
    } catch (e) { return reply({error:e.message},400); }
});
