"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { GitHubLoginButton } from "@/src/components/auth/github-login-button";
import { isAuthErrorCode } from "@/src/constants/errors/auth/code";
import { getErrorMessage } from "@/src/constants/errors/auth/messages";
import { useToast } from "@/src/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // 에러 토스트 표시
  useEffect(() => {
    if (error && isAuthErrorCode(error.toUpperCase())) {
      const timer = setTimeout(() => {
        toast({
          variant: "destructive",
          description: getErrorMessage(error),
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [error, toast]);

  return (
    <section aria-label="login">
      <h2 className="text-lg font-semibold text-center mb-4">
        SNS 계정으로 로그인
      </h2>
      <GitHubLoginButton />
      <p
        className="mt-3 text-sm text-yellow-500 dark:text-yellow-400 text-center"
        role="alert"
      >
        관리자 계정으로만 로그인이 가능합니다
      </p>
    </section>
  );
}
