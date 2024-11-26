import { Administrator } from '@/src/modules/auth/entities/administrator.entity';

export class AdministratorsFactory {
  static createTestData(
    override: Partial<Administrator> = {},
  ): Partial<Administrator> {
    return {
      email: 'test@example.com',
      isTotpEnabled: false,
      ...override,
    };
  }
}
