// src/lib/gun.ts
import Gun from 'gun';
import 'gun/sea'; // для шифрования (опционально)

// Используем публичные релей-серверы
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun',
  ],
  localStorage: false, // не дублировать в localStorage
});

const emailDIDTable = gun.get('email_did_bindings');

export async function saveEmailDIDBinding(emailHash: string, did: string): Promise<void> {
  if (!emailHash || typeof emailHash !== 'string' || emailHash.length !== 64) {
    throw new Error('Invalid emailHash: must be a 64-character hex string');
  }

  if (!did || typeof did !== 'string' || !did.startsWith('did:key:')) {
    throw new Error(`Invalid DID: ${did}. Must be a valid did:key`);
  }

  return new Promise((resolve, reject) => {
    emailDIDTable.get(emailHash).put({ emailHash, did }, (ack) => {
      if (ack.err) {
        console.error('❌ GunDB save failed:', ack.err);
        reject(new Error('GunDB save failed: ' + ack.err));
      } else {
        console.log('✅ Saved to GunDB:', emailHash);
        resolve();
      }
    });
  });
}

export async function findDIDByEmailHash(emailHash: string): Promise<string | null> {
  return new Promise((resolve) => {
    emailDIDTable.get(emailHash).once((data) => {
      if (data && data.did) {
        console.log('✅ Found DID in GunDB:', data.did);
        resolve(data.did);
      } else {
        console.warn('🔍 DID not found in GunDB for emailHash:', emailHash);
        resolve(null);
      }
    });
  });
}