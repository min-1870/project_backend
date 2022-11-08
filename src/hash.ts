import crypto from 'crypto';

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}
