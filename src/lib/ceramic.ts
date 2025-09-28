import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';

const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';
let ceramicInstance: CeramicClient | null = null;

export function getCeramic(): CeramicClient {
  if (!ceramicInstance) {
    try {
      ceramicInstance = new CeramicClient(CERAMIC_URL);
      console.log('✅ Ceramic client initialized');
    } catch (err) {
      console.error('❌ Failed to initialize Ceramic client:', err);
      throw new Error('Ceramic initialization failed');
    }
  }
  return ceramicInstance;
}

export async function saveEmailDIDBinding(emailHash: string, did: string): Promise<string> {
  if (!emailHash || typeof emailHash !== 'string' || emailHash.length !== 64) {
    throw new Error('Invalid emailHash: must be a 64-character hex string');
  }

  if (!did || typeof did !== 'string' || !did.startsWith('did:key:')) {
    throw new Error(`Invalid DID: ${did}. Must be a valid did:key`);
  }

  const ceramic = getCeramic();

  try {
    console.log('📝 Creating TileDocument with emailHash:', emailHash, 'and DID:', did);
    
    const doc = await TileDocument.create(ceramic, { emailHash, did }, {
      controllers: [did],
    });

    console.log('✅ Document created successfully. Stream ID:', doc.id.toString());
    return doc.id.toString();
  } catch (err) {
    console.error('❌ Ceramic document creation failed:', err);
    throw new Error('Ceramic write failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

export async function findDIDByEmailHash(emailHash: string): Promise<string | null> {
  console.warn('🔍 Ceramic search not implemented yet — using localStorage fallback');
  return null;
}