"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { CodeInput } from "@/src/components/auth/code-input";
import { Spinner } from "@/src/components/ui/spinner";
import { isAuthErrorCode } from "@/src/constants/errors/auth/code";
import { getErrorMessage } from "@/src/constants/errors/auth/messages";
import { ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/use-auth";
import { useToast } from "@/src/hooks/use-toast";
import { useAuthStore } from "@/src/store/auth";

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { verify2FA, isVerifying2FA } = useAuth();
  const { setTempToken } = useAuthStore();

  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const token = searchParams.get("token");
  const mode = searchParams.get("mode");

  const isSetupMode = mode === "setup";

  // 파라미터 체크 및 설정
  useEffect(() => {
    // 토큰 파라미터 체크
    if (!token) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // 상태 관리 중인 토큰과 파라미터 토큰이 동일한지 체크
    const { tempToken } = useAuthStore.getState();
    if (tempToken && tempToken !== token) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // 모드 파라미터 체크
    if (mode && mode !== "setup") {
      router.replace(ROUTES.LOGIN);
      return;
    }

    setTempToken(token);
  }, [token, mode]);

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
  }, [error]);

  if (!token) return null;

  const handleCodeComplete = (code: string) => {
    verify2FA(token, code, mode);
  };

  return (
    <section aria-label="2fa-verification">
      <h2 className="text-lg font-semibold text-center mb-4">2단계 인증</h2>
      {isVerifying2FA ? (
        <div className="flex justify-center items-center">
          <Spinner
            className="text-black"
            aria-label="verification loading"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <CodeInput
              length={6}
              validateChar={(char) => /^\d$/.test(char)}
              onComplete={handleCodeComplete}
              aria-label="2fa code input"
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              인증 앱에 표시된 6자리 코드를 입력하세요
            </p>
          </div>

          {!isSetupMode && (
            <Link
              href={`${ROUTES.BACKUP_VERIFICATION}?token=${token}`}
              className="block text-center text-sm text-primary hover:underline underline-offset-4 mt-4"
            >
              백업 코드로 인증하기
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
