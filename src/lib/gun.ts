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

export async function saveEmailDIDBinding(emailHash: string, did: string): Promise<void> {
  if (!emailHash || typeof emailHash !== 'string' || emailHash.length !== 64) {
    throw new Error('Invalid emailHash: must be a 64-character hex string');
  }

  if (!did || typeof did !== 'string' || !did.startsWith('did:key:')) {
    throw new Error(`Invalid DID: ${did}. Must be a valid did:key`);
  }

  console.log('📤 Attempting to save to GunDB:', { emailHash, did });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('⏰ GunDB save timeout after 10 seconds');
      reject(new Error('GunDB save timeout'));
    }, 10000);

    emailDIDTable.get(emailHash).put({ emailHash, did }, (ack) => {
      clearTimeout(timeout);
      
      if (ack && typeof ack === 'object' && 'err' in ack) {
        console.error('❌ GunDB save failed:', ack.err);
        reject(new Error('GunDB save failed: ' + ack.err));
      } else {
        console.log('✅ GunDB save successful:', emailHash);
        resolve();
      }
    });

    // Дополнительное логирование: проверим, вызывается ли callback
    console.log('⏳ GunDB put() called, waiting for callback...');
  });
}

export async function findDIDByEmailHash(emailHash: string): Promise<string | null> {
  console.log('🔍 Searching GunDB for emailHash:', emailHash);
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('⏰ GunDB search timeout after 10 seconds');
      resolve(null);
    }, 10000);

    emailDIDTable.get(emailHash).once((data) => {
      clearTimeout(timeout);
      
      if (data && data.did) {
        console.log('✅ Found DID in GunDB:', data.did);
        resolve(data.did);
      } else {
        console.warn('🔍 DID not found in GunDB for emailHash:', emailHash);
        resolve(null);
      }
    });

    console.log('⏳ GunDB once() called, waiting for data...');
  });
}