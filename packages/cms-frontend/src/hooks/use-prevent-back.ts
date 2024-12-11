"use client";

import { useEffect } from "react";

// 뒤로가기 방지 훅
export const usePreventBack = () => {
  useEffect(() => {
    window.history.replaceState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.replaceState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};
