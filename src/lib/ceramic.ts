// src/lib/ceramic.ts
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';

const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';
let ceramicInstance: CeramicClient | null = null;

export function getCeramic(): CeramicClient {
  if (!ceramicInstance) {
    ceramicInstance = new CeramicClient(CERAMIC_URL, {
      // Отключаем проверку подписи для анонимной записи (только для тестовой сети!)
      anchorOnRequest: false,
    });
  }
  return ceramicInstance;
}

export async function saveEmailDIDBinding(emailHash: string, did: string): Promise<string> {
  const ceramic = getCeramic();
  
  // Создаём документ БЕЗ контроллеров — анонимно
  const doc = await TileDocument.create(ceramic, { emailHash, did });
  
  return doc.id.toString();
}

export async function findDIDByEmailHash(emailHash: string): Promise<string | null> {
  console.warn('Ceramic search not implemented yet — using localStorage fallback');
  return null;
}