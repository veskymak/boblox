/* Authenticated account operations. No local success or alternate database on failure. */
(function (root) {
    async function rpcForUser(sb, userId, command, payload, requestId, capturedSession) {
        const session = capturedSession || (await sb.auth.getSession()).data?.session;
        if (!session?.access_token || session.user?.id !== userId) throw new Error('Relace byla změněna.');
        const request = sb.rpc('account_command', { command, payload, request_id: requestId });
        if (typeof request.setHeader !== 'function') throw new Error('Nepodporovaná verze klienta.');
        return await request.setHeader('Authorization', 'Bearer ' + session.access_token);
    }
    function failure(error, status = 503) {
        return {
            ok: false,
            status,
            data: { error: error?.message || String(error || 'Server není dostupný.') }
        };
    }
    async function request(sb, path, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const supported =
            /^\/api\/(blackjack\/table|auth\/|user\/sync|daily-claim|account\/command|friends\/|chat\/|transactions|announcements|admin\/broadcast)/.test(
                path
            );
        if (!supported) return null;
        try {
            if (path === '/api/blackjack/table') {
                const session = (await sb.auth.getSession()).data?.session;
                if (!session && body.guest !== true) return failure('Přihlas se prosím znovu.', 401);
                const { data, error } = await sb.functions.invoke('blackjack-table', {
                    body, ...(body.guest === true ? {} : { headers: { Authorization: 'Bearer ' + session.access_token } })
                });
                return error ? failure(error) : { ok: true, status: 200, data };
            }
            if (path === '/api/announcements') {
                const { data, error } = await sb
                    .from('announcements')
                    .select('id,message,sender,created_at')
                    .gte('created_at', Date.now() - 60000)
                    .order('created_at', { ascending: false })
                    .limit(10);
                return error
                    ? failure(error)
                    : { ok: true, status: 200, data: { announcements: data || [] } };
            }
            if (path === '/api/auth/logout') {
                const { error } = await sb.auth.signOut();
                return error ? failure(error) : { ok: true, status: 200, data: { ok: true } };
            }
            if (path === '/api/auth/reset-password') {
                const email = String(body.email || '').trim();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.toLowerCase().endsWith('@boblox.cz')) return failure('Zadej svůj potvrzený e-mail.', 400);
                const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: body.redirectTo });
                return error ? failure(error, 400) : { ok: true, status: 200, data: { ok: true } };
            }
            if (path === '/api/auth/login' || path === '/api/auth/register') {
                const username = String(body.username || '').trim();
                const registering = path.endsWith('register');
                if (registering && body.ageOver15 !== true) return failure('Potvrď, že je ti více než 15 let.', 400);
                const email = String(body.email || '').trim().toLowerCase();
                if (registering && (!/^[a-zA-Z0-9_]{3,20}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith('@boblox.cz')))
                    return failure('Vyplň platné jméno a skutečný e-mail.', 400);
                let data, error;
                if (registering) {
                    ({ data, error } = await sb.auth.signUp({ email, password: body.password,
                        options: { data: { username }, emailRedirectTo: body.redirectTo } }));
                    if (!error && !data?.session) return { ok: true, status: 200, data: { confirmationRequired: true } };
                } else {
                    const login = await sb.functions.invoke('account-login', { body: { username, password: body.password } });
                    error = login.error;
                    if (!error && login.data?.session) ({ data, error } = await sb.auth.setSession(login.data.session));
                }
                if (error || !data?.session)
                    return failure(
                        error ||
                            'Přihlášení vyžaduje ověření účtu. Starší účet musí být bezpečně převeden na Supabase Auth.',
                        401
                    );
                if (registering) {
                    const created = await rpcForUser(
                        sb,
                        data.user.id,
                        'register',
                        { username },
                        crypto.randomUUID(),
                        data.session
                    );
                    if (created.error) return failure(created.error, 400);
                    const consent = await sb.from('account_consents').insert({ user_id: data.user.id, age_over_15: true });
                    if (consent.error && consent.error.code !== '23505') return failure(consent.error);
                }
            }
            const { data: verified, error: authError } = await sb.auth.getUser();
            if (authError || !verified?.user) return failure('Přihlas se prosím znovu.', 401);
            if (path === '/api/auth/privacy-export') {
                const session = (await sb.auth.getSession()).data?.session;
                if (!session?.access_token || session.user?.id !== verified.user.id) return failure('Relace byla změněna.', 401);
                const { data, error } = await sb.rpc('privacy_export').setHeader('Authorization', 'Bearer ' + session.access_token);
                return error ? failure(error) : { ok: true, status: 200, data };
            }
            if (path === '/api/auth/consent') {
                if (method === 'POST') {
                    if (body.ageOver15 !== true) return failure('Potvrď, že je ti více než 15 let.', 400);
                    const { error } = await sb.from('account_consents').insert({ user_id: verified.user.id, age_over_15: true });
                    if (error && error.code !== '23505') return failure(error);
                }
                const { data, error } = await sb.from('account_consents').select('version').eq('user_id', verified.user.id).maybeSingle();
                return error ? failure(error) : { ok: true, status: 200, data: { accepted: data?.version === 1 } };
            }
            if (path === '/api/auth/email-status' || path === '/api/auth/email-dismiss') {
                const { data, error } = await sb.rpc('recovery_email_status', { dismiss: path.endsWith('dismiss') });
                return error ? failure(error) : { ok: true, status: 200, data };
            }
            if (path === '/api/auth/email') {
                const email = String(body.email || '').trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith('@boblox.cz')) return failure('Zadej platný e-mail.', 400);
                const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: body.redirectTo });
                return error ? failure(error, 400) : { ok: true, status: 200, data: { confirmationRequired: true } };
            }
            if (path === '/api/auth/password') {
                const { error } = await sb.auth.updateUser({ password: body.password });
                return error ? failure(error, 400) : { ok: true, status: 200, data: { ok: true } };
            }
            let command = 'me';
            let payload = body;
            if (path === '/api/user/sync') command = 'profile';
            else if (path === '/api/announcements') command = 'announcements';
            else if (path === '/api/admin/broadcast') command = 'broadcast';
            else if (path === '/api/daily-claim') command = 'daily';
            else if (path === '/api/account/command') {
                command = body.command;
                payload = body.payload || {};
            } else if (path.startsWith('/api/friends/')) command = 'friend_' + path.split('/').pop();
            else if (path.startsWith('/api/chat/')) {
                command = method === 'POST' ? 'message_send' : 'messages';
                if (method === 'GET')
                    payload = {
                        partner: new URL(path, 'https://boblox.invalid').searchParams.get('partner')
                    };
            } else if (path.startsWith('/api/transactions')) command = 'transactions';
            const id = body.requestId || crypto.randomUUID();
            let { data, error } = await rpcForUser(sb, verified.user.id, command, payload, id);
            // A confirmed signup can return on a different device before a profile exists.
            if (error && path === '/api/auth/me' && verified.user.user_metadata?.username) {
                ({ data, error } = await rpcForUser(sb, verified.user.id, 'register',
                    { username: verified.user.user_metadata.username }, crypto.randomUUID()));
            }
            if (error)
                return failure(error, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
            if (data.user) {
                data.user.wheelAt = data.wheelAt;
                data.user.extraSpin = data.extraSpin;
            }
            if (path.startsWith('/api/auth/')) {
                data.token = 'sb_jwt_' + verified.user.id; // UI session marker; never an authorization credential.
            }
            return { ok: true, status: 200, data, fromServer: true };
        } catch (error) {
            return failure(error);
        }
    }
    const api = Object.freeze({ request });
    root.BobloxAccountBackend = api;
    if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
