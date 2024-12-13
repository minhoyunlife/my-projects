/**
 * 관리자 인터페이스
 */
export interface AdminUser {
  email: string;
  isAdmin: boolean;
  isTotpEnabled: boolean;
}
