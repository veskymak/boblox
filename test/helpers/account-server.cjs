const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
module.exports = async function accountServer() {
    const filename = path.resolve(__dirname, '../../server.js');
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    loaded._compile(
        fs
            .readFileSync(filename, 'utf8')
            .replace(
                "const dbPath = process.env.BOBLOX_DB_PATH || (process.env.NODE_TEST_CONTEXT ? ':memory:' : path.join(__dirname, 'boblox.db'));",
                "const dbPath = ':memory:';"
            ),
        filename
    );
    const { server, db, wss } = loaded.exports;
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    async function request(route, token, body) {
        const response = await fetch(base + route, {
            method: body ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        return { status: response.status, data: await response.json() };
    }
    async function register(username) {
        return (await request('/api/auth/register', null, { username, password: 'test-password-123!' })).data;
    }
    async function close() {
        for (const ws of wss.clients) ws.terminate();
        await new Promise((resolve) => wss.close(resolve));
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        db.close();
    }
    return { request, register, close, db, base };
};
