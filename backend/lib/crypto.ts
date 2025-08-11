import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  return crypto.pbkdf2Sync(key, 'choco-salt', 100000, KEY_LENGTH, 'sha256');
}

export function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(token, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const tag = cipher.getAuthTag();
  
  const ivLength = Buffer.alloc(4);
  ivLength.writeUInt32BE(iv.length, 0);
  
  const tagLength = Buffer.alloc(4);
  tagLength.writeUInt32BE(tag.length, 0);
  
  const combined = Buffer.concat([ivLength, iv, tagLength, tag, encrypted]);
  
  return combined.toString('base64');
}

export function decryptToken(encryptedString: string): string {
  const key = getEncryptionKey();
  
  const buffer = Buffer.from(encryptedString, 'base64');
  
  let offset = 0;
  
  const ivLength = buffer.readUInt32BE(offset);
  offset += 4;
  
  const iv = buffer.subarray(offset, offset + ivLength);
  offset += ivLength;
  
  const tagLength = buffer.readUInt32BE(offset);
  offset += 4;
  
  const tag = buffer.subarray(offset, offset + tagLength);
  offset += tagLength;
  
  const encryptedData = buffer.subarray(offset);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedData, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
