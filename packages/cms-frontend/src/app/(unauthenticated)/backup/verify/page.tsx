"use client";

import { Suspense, useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { CodeInput } from "@/src/components/(unauthenticated)/code-input";
import { Spinner } from "@/src/components/common/spinner";
import { isAuthErrorCode } from "@/src/constants/auth/error-codes";
import { getErrorMessage } from "@/src/constants/auth/error-messages";
import { useAuth } from "@/src/hooks/auth/use-auth";
import { useToast } from "@/src/hooks/use-toast";
import { ROUTES } from "@/src/routes";
import { useAuthStore } from "@/src/store/auth";

function BackupVerify() {
  const router = useRouter();
  const { toast } = useToast();

  const { isVerifyingBackup, verifyBackupCode } = useAuth();
  const { setTempToken } = useAuthStore();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

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

    setTempToken(token);
  }, [token]);

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

  const handleCodeComplete = async (code: string) => {
    await verifyBackupCode(code);
  };

  if (!token) return null;

  return (
    <section aria-label="backup-code-verification">
      <h2 className="text-lg font-semibold text-center mb-4">
        백업 코드로 인증
      </h2>
      {isVerifyingBackup ? (
        <div className="flex justify-center items-center">
          <Spinner
            className="text-black"
            aria-label="backup code verification loading"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <CodeInput
              length={8}
              validateChar={(char) => /^[0-9A-Z]$/.test(char)}
              onComplete={handleCodeComplete}
              aria-label="backup code input"
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              저장해놓은 8자리 코드 중 하나를 입력하세요
            </p>
          </div>
          <Link
            href={`${ROUTES.TWO_FACTOR_VERIFICATION}?token=${token}`}
            className="block text-center text-sm text-primary hover:underline underline-offset-4 mt-4"
          >
            TOTP 코드로 인증하기
          </Link>
        </div>
      )}
    </section>
  );
}

export default function BackupVerifyPage() {
  return (
    <Suspense>
      <BackupVerify />
    </Suspense>
  );
}
