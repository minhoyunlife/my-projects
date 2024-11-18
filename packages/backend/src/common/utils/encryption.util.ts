import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

interface EncryptedData {
  initialVector: string;
  content: string;
  authTag: string;
}

/**
 * 평문을 사전에 정해진 알고리즘을 바탕으로 암호화
 * @param plain 암호화할 평문
 * @param key Base64로 인코딩된 32바이트 암호화 키
 * @returns 암호화된 데이터를 base64로 인코딩한 문자열
 */
export function encrypt(plain: string, key: string): string {
  if (Buffer.from(key, 'base64').length !== 32) {
    throw new Error(
      'Invalid encryption key: Must be 32 bytes (base64 encoded)',
    );
  }

  const initialVector = randomBytes(12);

  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(key, 'base64'),
    initialVector,
  );

  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  const encryptedData: EncryptedData = {
    initialVector: initialVector.toString('base64'),
    content: encrypted.toString('base64'),
    authTag: authTag.toString('base64'),
  };

  return Buffer.from(JSON.stringify(encryptedData)).toString('base64');
}

/**
 * 암호화된 문자열을 평문으로 복호화
 * @param encrypted base64로 인코딩된 암호화 데이터
 * @param key Base64로 인코딩된 32바이트 암호화 키
 * @returns 복호화된 평문
 */
export function decrypt(encrypted: string, key: string): string {
  const encryptedData: EncryptedData = JSON.parse(
    Buffer.from(encrypted, 'base64').toString('utf8'),
  );

  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'base64'),
    Buffer.from(encryptedData.initialVector, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.content, 'base64')),
    decipher.final(), // authTag 검증도 같이 수행
  ]);

  return decrypted.toString('utf8');
}
