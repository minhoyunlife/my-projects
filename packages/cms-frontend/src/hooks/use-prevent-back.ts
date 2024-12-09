import { useEffect } from "react";

// 뒤로가기 방지 훅
export const usePreventBack = () => {
  useEffect(() => {
    // 뒤로가기 방지
    history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // 새로고침 방지
    const preventReload = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", preventReload);

    // 단축키 방지 (Alt + ←, Cmd + ←)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isBackKey =
        (e.altKey && e.key === "ArrowLeft") ||
        (e.metaKey && e.key === "ArrowLeft");
      if (isBackKey) e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", preventReload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
