/**
 * 깃헙 유저의 프로파일 인터페이스
 */
export interface GithubProfile {
  id: string;
  emails: { value: string; primary: boolean }[];
  photos: { value: string }[];
}
