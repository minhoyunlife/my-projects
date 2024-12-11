"use client";

import { useEffect } from "react";

// 새로고침 방지 훅
export const usePreventRefresh = () => {
  useEffect(() => {
    const preventReload = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", preventReload);

    return () => {
      window.removeEventListener("beforeunload", preventReload);
    };
  }, []);
};
