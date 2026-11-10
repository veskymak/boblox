import { createHash, randomBytes, randomInt } from 'node:crypto';

// A guest capability authorizes only this persistent casino wallet.
export function guestCredentials(input) {
    const existing = input.guestToken;
    if (existing != null && (typeof existing !== 'string' || !/^[a-f0-9]{64}$/.test(existing)))
        throw Error('Neplatná relace hosta.');
    if (existing == null && input.action !== 'sync') throw Error('Nejprve se připoj ke stolu.');
    const token = existing || randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(token).digest('hex');
    const name = typeof input.guestName === 'string' && /^Guest \d{4}$/.test(input.guestName)
        ? input.guestName : 'Guest ' + randomInt(1000,10000);
    return { token, hash, name, create: existing == null };
}
