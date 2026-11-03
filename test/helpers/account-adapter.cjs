const backend = require('../../src/state/AccountBackend');
module.exports.request = (client, ...args) => {
    const original = client.rpc;
    const wrapped = {
        ...client,
        auth: {
            ...client.auth,
            getSession:
                client.auth.getSession ||
                (async () => ({
                    data: {
                        session: {
                            access_token: 'test-session-token',
                            user: (await client.auth.getUser()).data.user
                        }
                    }
                }))
        },
        rpc(name, payload) {
            const response = original(name, payload);
            return {
                setHeader(key, value) {
                    client.lastAuthorization = [key, value];
                    return this;
                },
                then(resolve, reject) {
                    return Promise.resolve(response).then(resolve, reject);
                }
            };
        }
    };
    return backend.request(wrapped, ...args);
};
