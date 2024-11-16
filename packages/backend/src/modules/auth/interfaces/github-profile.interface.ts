export interface GithubProfile {
  id: string;
  emails: { value: string; primary: boolean }[];
  displayName: string;
  username: string;
}
