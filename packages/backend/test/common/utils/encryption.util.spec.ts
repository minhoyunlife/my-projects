import { randomBytes } from 'crypto';

import { decrypt, encrypt } from '@/src/common/utils/encryption.util';

describeWithoutDeps('EncryptionUtil', () => {
  const key = randomBytes(32).toString('base64'); // 32바이트 키

  describe('encrypt()', () => {
    it('주어진 평문을 암호화하여 base64로 인코딩한 문자열로 반환됨', () => {
      const encrypted = encrypt('test', key);

      const decoded = Buffer.from(encrypted, 'base64').toString('utf8');
      const parsedData = JSON.parse(decoded);

      expect(parsedData).toHaveProperty('initialVector');
      expect(parsedData).toHaveProperty('content');
      expect(parsedData).toHaveProperty('authTag');

      expect(() =>
        Buffer.from(parsedData.initialVector, 'base64'),
      ).not.toThrow();
      expect(() => Buffer.from(parsedData.content, 'base64')).not.toThrow();
      expect(() => Buffer.from(parsedData.authTag, 'base64')).not.toThrow();
    });

    it('같은 평문이 주어져도 실행 시마다 다른 문자열이 반환됨', () => {
      const text = 'test';

      const encrypted1 = encrypt(text, key);
      const encrypted2 = encrypt(text, key);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('키가 유효하지 않은 경우 에러가 발생함', () => {
      const invalidKey = 'invalid-key';
      expect(() => encrypt('test', invalidKey)).toThrowError();
    });
  });

  describe('decrypt()', () => {
    it('암호화된 문자열을 복호화할 경우 원본 평문과 일치함', () => {
      const text = 'test';
      const encrypted = encrypt(text, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(text);
    });

    it('암호화된 content가 변조되면 복호화 시 실패해야 함', () => {
      const encrypted = encrypt('test', key);
      const encryptedData = JSON.parse(
        Buffer.from(encrypted, 'base64').toString('utf8'),
      );
      encryptedData.content = [...encryptedData.content].reverse().join('');

      const tampered = Buffer.from(JSON.stringify(encryptedData)).toString(
        'base64',
      );

      expect(() => decrypt(tampered, key)).toThrowError();
    });

    it('initialVector가 변조되면 복호화 시 실패해야 함', () => {
      const encrypted = encrypt('test', key);
      const encryptedData = JSON.parse(
        Buffer.from(encrypted, 'base64').toString('utf8'),
      );
      encryptedData.initialVector = [...encryptedData.initialVector]
        .reverse()
        .join('');

      const tampered = Buffer.from(JSON.stringify(encryptedData)).toString(
        'base64',
      );

      expect(() => decrypt(tampered, key)).toThrowError();
    });

    it('authTag가 변조되면 복호화 시 실패해야 함', () => {
      const encrypted = encrypt('test', key);
      const encryptedData = JSON.parse(
        Buffer.from(encrypted, 'base64').toString('utf8'),
      );
      encryptedData.authTag = [...encryptedData.authTag].reverse().join('');

      const tampered = Buffer.from(JSON.stringify(encryptedData)).toString(
        'base64',
      );

      expect(() => decrypt(tampered, key)).toThrowError();
    });

    it('유효하지 않은 base64 문자열의 경우, 복호화에 실패함', () => {
      expect(() => decrypt('invalid-base64', key)).toThrowError();
    });
  });
});
