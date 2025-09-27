// src/lib/did.ts
import { generateKeyPair } from '@stablelib/ed25519';
import { base58btc } from 'multiformats/bases/base58';

export type DIDKeyPair = {
  did: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};

export function createDIDKeyPair(): DIDKeyPair {
  const { publicKey, secretKey: privateKey } = generateKeyPair();

  // Префикс для Ed25519 в did:key: 0xed01
  const prefix = new Uint8Array([0xed, 0x01]);
  const prefixedKey = new Uint8Array(prefix.length + publicKey.length);
  prefixedKey.set(prefix);
  prefixedKey.set(publicKey, prefix.length);

  // Кодируем в base58btc
  const encoded = base58btc.encode(prefixedKey);
  const did = `did:key:${encoded}`;

  return { did, privateKey, publicKey };
}