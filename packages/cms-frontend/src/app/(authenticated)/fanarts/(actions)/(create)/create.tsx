import { useState } from "react";

import { MetadataStep } from "@/src/app/(authenticated)/fanarts/(actions)/(create)/metadata-step";
import { UploadStep } from "@/src/app/(authenticated)/fanarts/(actions)/(create)/upload-step";
import { Steps } from "@/src/components/(authenticated)/steps";

export function CreateArtworkForm({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState<"upload" | "metadata">("upload");
  const [selectedFile, setSeletedFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      <Steps
        items={[
          {
            title: "이미지 업로드",
            status: step === "upload" ? "current" : "complete",
          },
          {
            title: "작품 정보 입력",
            status: step === "metadata" ? "current" : "upcoming",
          },
        ]}
      />

      {step === "upload" ? (
        <UploadStep
          onSuccess={(file) => {
            setSeletedFile(file);
            setStep("metadata");
          }}
        />
      ) : (
        <MetadataStep
          file={selectedFile!}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
