import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

const marker = 'yaa:v1:';

function masterKey(): Buffer {
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (!configured)
    throw new Error(
      'DATA_ENCRYPTION_KEY doit être configurée pour protéger les données personnelles.',
    );
  const decoded = /^[a-f\d]{64}$/i.test(configured)
    ? Buffer.from(configured, 'hex')
    : Buffer.from(configured, 'base64');
  if (decoded.length !== 32)
    throw new Error(
      'DATA_ENCRYPTION_KEY doit contenir 32 octets encodés en hexadécimal ou base64.',
    );
  return decoded;
}

function deriveKey(purpose: 'encryption' | 'blind-index'): Buffer {
  return Buffer.from(
    hkdfSync('sha256', masterKey(), Buffer.from('yaa-coaching-data-v1'), Buffer.from(purpose), 32),
  );
}

export function encryptSensitive(value: string): string {
  if (value.startsWith(marker)) return value;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey('encryption'), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${marker}${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSensitive(value: string): string {
  if (!value.startsWith(marker)) return value; // Compatibilité pendant la migration des anciennes lignes.
  const [, version, ivText, tagText, encryptedText] = value.split(':');
  if (version !== 'v1' || !ivText || !tagText || !encryptedText)
    throw new Error('Format de donnée chiffrée inconnu.');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    deriveKey('encryption'),
    Buffer.from(ivText, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

export function blindIndex(value: string): string {
  return createHmac('sha256', deriveKey('blind-index'))
    .update(value.trim().toLowerCase())
    .digest('hex');
}
