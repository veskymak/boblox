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
            /^\/api\/(auth\/|user\/sync|daily-claim|account\/command|friends\/|chat\/|transactions|announcements|admin\/broadcast)/.test(
                path
            );
        if (!supported) return null;
        try {
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
            if (path === '/api/auth/login' || path === '/api/auth/register') {
                const username = String(body.username || '').trim();
                if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return failure('Neplatné jméno.', 400);
                const credentials = { email: username.toLowerCase() + '@boblox.cz', password: body.password };
                const registering = path.endsWith('register');
                const { data, error } = registering
                    ? await sb.auth.signUp({ ...credentials, options: { data: { username } } })
                    : await sb.auth.signInWithPassword(credentials);
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
                }
            }
            const { data: verified, error: authError } = await sb.auth.getUser();
            if (authError || !verified?.user) return failure('Přihlas se prosím znovu.', 401);
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
            const { data, error } = await rpcForUser(sb, verified.user.id, command, payload, id);
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
