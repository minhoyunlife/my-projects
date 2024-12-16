import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";

import type { AdminUser } from "@/src/lib/utils/cookie";

interface AuthState {
  tempToken: string | undefined;
  accessToken: string | undefined;
  setupToken: string | undefined;
  backupCodes: string[] | undefined;
  user: AdminUser | undefined;
  setTempToken: (token: string) => void;
  setAccessToken: (token: string) => void;
  clearTempToken: () => void;
  clearAccessToken: () => void;
  setSetupToken: (token: string) => void;
  clearSetupToken: () => void;
  setBackupCodes: (codes: string[]) => void;
  clearBackupCodes: () => void;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set) => ({
        tempToken: undefined,
        setupToken: undefined,
        backupCodes: undefined,
        accessToken: undefined,
        user: undefined,
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
        setUser: (user) => set({ user }, false, "auth/setUser"),
        clearUser: () => set({ user: undefined }, false, "auth/clearUser"),
      }),
      { name: "Auth Store" },
    ),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        setupToken: state.setupToken,
        user: state.user,
      }),
    },
  ),
);
