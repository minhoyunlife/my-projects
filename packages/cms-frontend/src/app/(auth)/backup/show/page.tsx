"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { ROUTES } from "@/src/constants/routes";
import { useAuthStore } from "@/src/store/auth";

export default function BackupCodesPage() {
  const router = useRouter();
  const { backupCodes, clearBackupCodes } = useAuthStore();

  if (!backupCodes) return null;

  const downloadBackupCodes = () => {
    if (backupCodes) {
      const text = `My Projects Admin - 백업 코드\n\n${backupCodes.join("\n")}`;
      const blob = new Blob([text], { type: "text/plain;charset=UTF-8" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "backup-codes.txt";
      link.click();

      URL.revokeObjectURL(link.href);
    }
  };

  const handleConfirm = () => {
    clearBackupCodes();

    router.replace(ROUTES.DASHBOARD);
  };

  return (
    <section aria-label="backup-codes">
      <h2 className="text-lg font-semibold text-center mb-4">백업 코드 저장</h2>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <p
            aria-label="backup-codes-description"
            className="text-sm text-muted-foreground"
          >
            2단계 인증 기기에 접근할 수 없는 경우를 대비하여 아래의 백업 코드를
            안전한 곳에 저장해주세요.
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code
                key={code}
                data-testid={`backup-code-${index}`}
                className="text-center bg-muted p-2 rounded font-mono"
              >
                {code}
              </code>
            ))}
          </div>
        </Card>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-500"
            onClick={downloadBackupCodes}
          >
            백업 코드 다운로드
          </Button>
          <Button
            className="w-full focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-500"
            onClick={handleConfirm}
          >
            확인
          </Button>
          <p
            aria-label="backup-codes-warning"
            className="text-xs text-center text-muted-foreground"
          >
            백업 코드는 이 페이지를 벗어나면 다시 확인할 수 없습니다
          </p>
        </div>
      </div>
    </section>
  );
}
