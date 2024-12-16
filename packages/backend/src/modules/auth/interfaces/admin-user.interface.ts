/**
 * 관리자 인터페이스
 */
export interface AdminUser {
  email: string;
  avatarUrl: string;
  isAdmin: boolean;
  isTotpEnabled: boolean;
}
