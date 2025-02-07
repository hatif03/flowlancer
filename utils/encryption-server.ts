import * as crypto from 'crypto';


const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;


const getEncryptionKey = (): Buffer => {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key is not configured');
  }
  return Buffer.from(key, 'base64');
};


export const decryptData = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

 
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);


    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);


    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};