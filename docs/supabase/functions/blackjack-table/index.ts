import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { advanceTable, validateRoom, changedTable, persistableTable } from './table.mjs';
import { guestCredentials } from './guest.mjs';

const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {headers,status});
Deno.serve(async req => {
    if (req.method === 'OPTIONS') return new Response(null,{headers});
    if (req.method !== 'POST') return reply({},405);
    try {
        const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false}});
        const input = await req.json();
        validateRoom(input.room);
        let actorId;
        let guest;
        if (input.guest === true) {
            guest = guestCredentials(input);
            const opened = await db.rpc('blackjack_guest_open', { token_hash:guest.hash, create_guest:guest.create,guest_name:guest.name });
            if (opened.error || !opened.data) return reply({error:'Relace hosta není dostupná.'},401);
            actorId = 'guest:' + guest.hash;
        } else {
            const token = req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
            if (!token) return reply({},401);
            const {data:{user}} = await db.auth.getUser(token);
            if (!user) return reply({},401);
            actorId = user.id;
        }
        for (let n = 0; n < 4; n++) {
            const {data, error} = guest
                ? await db.rpc('blackjack_guest_table_read',{room_key:input.room, token_hash:guest.hash})
                : await db.rpc('blackjack_table_read',{room_key:input.room, actor:actorId});
            if (error || !data) throw Error('Stůl není dostupný.');
            const {state,changes,view} = advanceTable(data.state,data.actor,input,Date.now());
            if (changedTable(data.state,state)) {
                const saved = await db.rpc('blackjack_table_commit',{room_key:input.room,expected_version:data.version,table_state:persistableTable(state,data.actor,view.now),deltas:changes});
                if (saved.error) throw Error('Změnu stolu se nepodařilo uložit.');
                if (!saved.data) continue;
            }
            return reply({...view, balance:data.actor.coins + (changes[actorId] || 0),
                ...(guest ? {guestToken:guest.token,guestName:data.actor.username} : {})});
        }
        return reply({error:'Stůl se změnil. Zkus tah znovu.'},409);
    } catch (e) { return reply({error:e.message},400); }
});
