"use client";

import { GitHubLoginButton } from "@/src/components/auth/github-login-button";
import { LOGIN_ERROR_MESSAGES } from "@/src/constants/messages";
import { useToast } from "@/src/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  function isLoginError(
    error: string,
  ): error is keyof typeof LOGIN_ERROR_MESSAGES {
    return error in LOGIN_ERROR_MESSAGES;
  }

  useEffect(() => {
    if (error && isLoginError(error)) {
      toast({
        variant: "destructive",
        description: LOGIN_ERROR_MESSAGES[error],
      });
    }
  }, [error, toast]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      role="region"
      aria-label="login"
    >
      <h2 className="text-lg font-semibold text-center mb-4">로그인</h2>
      <GitHubLoginButton />
      <p className="mt-3 text-sm text-yellow-500 dark:text-yellow-400 text-center">
        관리자 계정으로만 로그인이 가능합니다
      </p>
    </form>
  );
}
