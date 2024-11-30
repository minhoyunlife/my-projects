"use client";

import { CodeInput } from "@/src/components/auth/code-input";
import { Button } from "@/src/components/ui/button";
import { TWO_FACTOR_ERROR_MESSAGES } from "@/src/constants/messages";
import { useAuth } from "@/src/hooks/auth";
import { useToast } from "@/src/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TwoFactorAuthPage() {
  const { toast } = useToast();
  const { verify2FA } = useAuth();

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  function isTwoFactorError(
    error: string,
  ): error is keyof typeof TWO_FACTOR_ERROR_MESSAGES {
    return error in TWO_FACTOR_ERROR_MESSAGES;
  }

  useEffect(() => {
    if (error && isTwoFactorError(error)) {
      toast({
        variant: "destructive",
        description: TWO_FACTOR_ERROR_MESSAGES[error],
      });
    }
  }, [error, toast]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      role="region"
      aria-label="2fa-verification"
    >
      <h2 className="text-lg font-semibold text-center mb-4">2단계 인증</h2>
      <div className="space-y-4">
        <CodeInput
          length={6}
          validateChar={(char) => /^\d$/.test(char)}
          onComplete={() => {}}
        />
        <Button className="w-full">확인</Button>
        <Button
          variant="link"
          className="w-full"
        >
          백업 코드로 인증하기
        </Button>
      </div>
    </form>
  );
}
