// src/lib/gun.ts
import Gun from 'gun';
import 'gun/sea';

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun',
  ],
  localStorage: false,
});

const emailDIDTable = gun.get('email_did_bindings');

// Type guard для проверки ошибки
function isGunError(ack: any): ack is { err: string } {
  return ack && typeof ack === 'object' && 'err' in ack;
}

// Type guard для проверки успеха
function isGunSuccess(ack: any): ack is { ok: { '': 1 } } {
  return ack && typeof ack === 'object' && 'ok' in ack;
}

export async function saveEmailDIDBinding(emailHash: string, did: string): Promise<void> {
  if (!emailHash || typeof emailHash !== 'string' || emailHash.length !== 64) {
    throw new Error('Invalid emailHash: must be a 64-character hex string');
  }

  if (!did || typeof did !== 'string' || !did.startsWith('did:key:')) {
    throw new Error(`Invalid DID: ${did}. Must be a valid did:key`);
  }

  return new Promise((resolve, reject) => {
    emailDIDTable.get(emailHash).put({ emailHash, did }, (ack) => {
      if (isGunError(ack)) {
        console.error('❌ GunDB save failed:', ack.err);
        reject(new Error('GunDB save failed: ' + ack.err));
      } else if (isGunSuccess(ack)) {
        console.log('✅ Saved to GunDB:', emailHash);
        resolve();
      } else {
        // Если ack пустой или неизвестный — считаем успешным
        console.log('✅ Saved to GunDB (unknown ack):', emailHash);
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