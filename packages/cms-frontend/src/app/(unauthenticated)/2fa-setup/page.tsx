"use client";

import { Suspense, useCallback, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/src/components/base/button";
import { Card } from "@/src/components/base/card";
import { Spinner } from "@/src/components/common/spinner";
import { ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/use-auth";
import { useAuthStore } from "@/src/store/auth";

function TwoFactorSetup() {
  const router = useRouter();
  const { setup2FA, isSettingUp2FA } = useAuth();
  const { setTempToken } = useAuthStore();

  const [totpSetupData, setTotpSetupData] = useState<{
    qrCodeUrl: string;
    manualEntryKey: string;
    setupToken: string;
  }>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const initialize = useCallback(() => {
    if (!token) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    setTempToken(token);

    void setup2FA().then(({ data }) => {
      setTotpSetupData(data);
    });
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  if (!token) return null;

  return (
    <section aria-label="2fa-setup">
      <h2 className="text-lg font-semibold text-center mb-4">
        2단계 인증 설정
      </h2>
      {isSettingUp2FA ? (
        <div className="flex justify-center items-center">
          <Spinner
            className="text-black"
            aria-label="setup loading"
          />
        </div>
      ) : (
        totpSetupData && (
          <div className="space-y-6 mb-8">
            <div
              onContextMenu={(e) => e.preventDefault()}
              className="flex flex-col items-center user-select-none"
            >
              <QRCodeCanvas
                value={totpSetupData.qrCodeUrl}
                className="mb-4 pointer-events-none"
                aria-label="qr code"
                role="img"
              />
              <p className="text-sm text-muted-foreground">
                TOTP 앱으로 QR 코드를 스캔하세요
              </p>
            </div>

            <Card className="p-4">
              <p className="text-sm font-medium mb-2">수동 입력 코드</p>
              <code className="block w-full text-center bg-muted p-2 rounded select-all">
                {totpSetupData.manualEntryKey}
              </code>
            </Card>

            <Button
              className="w-full focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-500"
              onClick={() =>
                router.replace(
                  `${ROUTES.TWO_FACTOR_VERIFICATION}?token=${token}&mode=setup`,
                )
              }
            >
              인증하러 가기
            </Button>
          </div>
        )
      )}
    </section>
  );
}

export default function TwoFactorSetupPage() {
  return (
    <Suspense>
      <TwoFactorSetup />
    </Suspense>
  );
}
