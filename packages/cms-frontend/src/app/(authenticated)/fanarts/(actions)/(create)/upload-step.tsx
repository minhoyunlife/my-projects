import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import {
  uploadSchema,
  type UploadFormData,
} from "@/src/schemas/artworks/upload";

export function UploadStep({ onSuccess }: { onSuccess: (file: File) => void }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    mode: "onChange",
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValue("file", file, { shouldValidate: true });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputRef.current!.files = dataTransfer.files;
  };

  const onSubmit = async (data: UploadFormData) => {
    onSuccess(data.file);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      submitText="다음 단계로"
      disabled={!isValid}
    >
      <div
        className={`
            relative border-2 border-dashed rounded-lg p-12 
            transition-colors cursor-pointer
            ${isDragActive ? "border-primary bg-muted" : "border-muted-foreground"}
            ${errors.file ? "border-destructive" : ""}
            hover:border-primary hover:bg-muted/50
          `}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setIsDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(false);

          const file = e.dataTransfer.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
      >
        <FormField
          data-testid="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          {...register("file", {
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            },
          })}
          ref={inputRef}
        />
        <div className="text-center">
          {selectedFile && previewUrl ? (
            <>
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={previewUrl}
                  alt={selectedFile.name}
                  width={128}
                  height={128}
                  className="object-cover rounded-lg w-auto h-auto"
                  unoptimized
                />
              </div>
              <p className="mt-2 text-sm text-foreground font-medium">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
              <button
                type="button"
                className="mt-4 text-sm text-primary font-semibold hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                다른 파일 선택
              </button>
            </>
          ) : (
            <>
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                이미지를 드래그하여 업로드하거나{" "}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => inputRef.current?.click()}
                >
                  클릭하여 선택
                </button>
                하세요
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP (최대 100MB)
              </p>
            </>
          )}
          {errors.file?.message && (
            <p
              data-testid="error"
              className="mt-2 text-sm text-destructive"
            >
              {errors.file.message}
            </p>
          )}
        </div>
      </div>
    </Form>
  );
}
