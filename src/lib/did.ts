import { generateKeyPair } from '@stablelib/ed25519';
import { base58btc } from 'multiformats/bases/base58';

export type DIDKeyPair = {
  did: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};

export function createDIDKeyPair(): DIDKeyPair {
  try {
    const { publicKey, secretKey: privateKey } = generateKeyPair();

    const prefix = new Uint8Array([0xed, 0x01]);
    const prefixedKey = new Uint8Array(prefix.length + publicKey.length);
    prefixedKey.set(prefix);
    prefixedKey.set(publicKey, prefix.length);

    const encoded = base58btc.encode(prefixedKey);
    const did = `did:key:${encoded}`;

    if (!did || typeof did !== 'string') {
      throw new Error('Failed to generate valid DID');
    }

    return { did, privateKey, publicKey };
  } catch (err) {
    console.error('❌ DID generation failed:', err);
    throw new Error('Failed to generate DID: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

// Хеширование email для анонимности
export async function hashEmail(email: string): Promise<string> {
  try {
    const normalized = email.toLowerCase().trim();
    if (!normalized || !normalized.includes('@')) {
      throw new Error('Invalid email format');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (err) {
    console.error('❌ Email hashing failed:', err);
    throw new Error('Failed to hash email: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}