import crypto from 'crypto';

const totallysecretstring = 'wowthisissosecurexD';

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export function hashToken(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext + totallysecretstring).digest('hex');
}
