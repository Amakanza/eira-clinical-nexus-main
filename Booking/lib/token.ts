import crypto from 'crypto';

export function opaqueToken(len = 32) {
  return crypto.randomBytes(len).toString('base64url'); // opaque, URL-safe
}
