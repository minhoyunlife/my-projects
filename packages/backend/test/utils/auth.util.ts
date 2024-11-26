import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';

export const createTestTempToken = async (
  authService: AuthService,
  user: Administrator,
) =>
  await authService.createTempToken({
    email: user.email,
    isAdmin: true,
  });

export const createTestAccessToken = async (
  authService: AuthService,
  user: Administrator,
) =>
  await authService.createAccessToken({
    email: user.email,
    isAdmin: true,
  });

export const createTestRefreshToken = async (
  authService: AuthService,
  user: Administrator,
) =>
  await authService.createRefreshToken({
    email: user.email,
    isAdmin: true,
  });

export const createTestCookies = (refreshToken: string) => {
  return [`refreshToken=${refreshToken}`];
};
