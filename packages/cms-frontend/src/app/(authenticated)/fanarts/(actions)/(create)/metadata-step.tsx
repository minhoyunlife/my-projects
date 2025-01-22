import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { GenreSelect } from "@/src/components/(authenticated)/genre-select";
import { ProgressWithLabel } from "@/src/components/(authenticated)/progress-with-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/base/select";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useToast } from "@/src/hooks/use-toast";
import { handleArtworkError } from "@/src/lib/utils/errors/artwork";
import {
  createArtworkSchema,
  type CreateArtworkFormData,
} from "@/src/schemas/artworks/create";

export function MetadataStep({
  file,
  onSuccess,
}: {
  file: File;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const { useCreate } = useArtworks();

  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<CreateArtworkFormData>({
    resolver: zodResolver(createArtworkSchema),
    mode: "onChange",
    defaultValues: {
      koTitle: "",
      enTitle: "",
      jaTitle: "",
      createdAt: undefined,
      playedOn: undefined,
      rating: undefined,
      koShortReview: "",
      enShortReview: "",
      jaShortReview: "",
      genreIds: [],
    },
  });

  const createArtworkMutation = useCreate({
    onProgress: setProgress,
  });

  const onSubmit = async (data: CreateArtworkFormData) => {
    try {
      await createArtworkMutation.mutateAsync({
        file,
        data,
      });
      toast({
        title: "작품이 등록되었습니다",
        variant: "success",
      });

      onSuccess?.();
    } catch (error) {
      handleArtworkError(error, toast, "작품 등록 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createArtworkMutation.isPending}
      submitText="작품 등록"
      disabled={!isValid}
    >
      <div className="space-y-4">
        <h3 className="text-sm font-medium">제목(필수)</h3>
        <FormField
          placeholder="작품 제목(한국어)"
          {...register("koTitle")}
          error={errors.koTitle?.message}
        />
        <FormField
          placeholder="작품 제목(영어)"
          {...register("enTitle")}
          error={errors.enTitle?.message}
        />
        <FormField
          placeholder="작품 제목(일본어)"
          {...register("jaTitle")}
          error={errors.jaTitle?.message}
        />
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">게임 정보(임의)</h3>

        {/* 날짜 선택 */}
        <FormField
          type="date"
          {...register("createdAt")}
          error={errors.createdAt?.message}
        />

        {/* 플랫폼 선택 */}
        <Controller
          name="playedOn"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="플랫폼을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Steam">Steam</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
                <SelectItem value="GOG">GOG</SelectItem>
                <SelectItem value="Epic Games">Epic Games</SelectItem>
                <SelectItem value="Android">Android</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* 평점 */}
        <FormField
          type="number"
          placeholder="평점 (0-20)"
          min={0}
          max={20}
          {...register("rating", { valueAsNumber: true })}
          error={errors.rating?.message}
        />
      </div>

      {/* 한줄평 */}
      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">한줄평(임의)</h3>
        <FormField
          placeholder="한줄평(한국어)"
          {...register("koShortReview")}
          error={errors.koShortReview?.message}
        />
        <FormField
          placeholder="한줄평(영어)"
          {...register("enShortReview")}
          error={errors.enShortReview?.message}
        />
        <FormField
          placeholder="한줄평(일본어)"
          {...register("jaShortReview")}
          error={errors.jaShortReview?.message}
        />
      </div>

      {/* 장르 선택 (Select) */}
      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">장르(임의)</h3>
        <Controller
          name="genreIds"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <GenreSelect
              value={field.value || []}
              onChange={field.onChange}
              error={errors.genreIds?.message}
            />
          )}
        />
      </div>

      {createArtworkMutation.isPending && (
        <div className="mt-4 space-y-2">
          <ProgressWithLabel value={progress} />
          <p className="text-sm text-center text-muted-foreground">
            {progress < 100 ? "이미지 업로드 중..." : "작품 정보 저장 중..."}
          </p>
        </div>
      )}
    </Form>
  );
}
