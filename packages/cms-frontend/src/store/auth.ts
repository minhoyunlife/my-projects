import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
  tempToken: string | undefined;
  accessToken: string | undefined;
  setupToken: string | undefined;
  backupCodes: string[] | undefined;
  setTempToken: (token: string) => void;
  setAccessToken: (token: string) => void;
  clearTempToken: () => void;
  clearAccessToken: () => void;
  setSetupToken: (token: string) => void;
  clearSetupToken: () => void;
  setBackupCodes: (codes: string[]) => void;
  clearBackupCodes: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      tempToken: undefined,
      setupToken: undefined,
      backupCodes: undefined,
      accessToken: undefined,
      setTempToken: (token) =>
        set({ tempToken: token }, false, "auth/setTempToken"),
      clearTempToken: () =>
        set({ tempToken: undefined }, false, "auth/clearTempToken"),
      setSetupToken: (token) =>
        set({ setupToken: token }, false, "auth/setSetupToken"),
      clearSetupToken: () =>
        set({ setupToken: undefined }, false, "auth/clearSetupToken"),
      setBackupCodes: (codes) =>
        set({ backupCodes: codes }, false, "auth/setBackupCodes"),
      clearBackupCodes: () =>
        set({ backupCodes: undefined }, false, "auth/clearBackupCodes"),
      setAccessToken: (token) =>
        set({ accessToken: token }, false, "auth/setAccessToken"),
      clearAccessToken: () =>
        set({ accessToken: undefined }, false, "auth/clearAccessToken"),
    }),
    { name: "Auth Store" },
  ),
);
