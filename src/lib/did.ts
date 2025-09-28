import { generateKeyPair } from '@stablelib/ed25519';
import { base58btc } from 'multiformats/bases/base58';

export type DIDKeyPair = {
  did: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};

export function createDIDKeyPair(): DIDKeyPair {
  const { publicKey, secretKey: privateKey } = generateKeyPair();

  const prefix = new Uint8Array([0xed, 0x01]);
  const prefixedKey = new Uint8Array(prefix.length + publicKey.length);
  prefixedKey.set(prefix);
  prefixedKey.set(publicKey, prefix.length);

  const encoded = base58btc.encode(prefixedKey);
  const did = `did:key:${encoded}`;

  return { did, privateKey, publicKey };
}

// Хеширование email для анонимности
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}