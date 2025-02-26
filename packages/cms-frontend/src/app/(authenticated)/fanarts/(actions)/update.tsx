import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { GenreSelect } from "@/src/components/(authenticated)/genre-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/base/select";
import type { Platform } from "@/src/constants/artworks/platform";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useToast } from "@/src/hooks/use-toast";
import { handleArtworkError } from "@/src/lib/utils/errors/artwork";
import type { UpdateArtworkFormData } from "@/src/schemas/artworks/update";
import { updateArtworkSchema } from "@/src/schemas/artworks/update";

export interface Artwork {
  id: string;
  imageUrl: string;
  translations: Array<{
    language: string;
    title: string;
    shortReview?: string;
  }>;
  createdAt?: string;
  playedOn?: string;
  rating?: number;
  genres: Array<{
    id: string;
    translations: Array<{
      language: string;
      name: string;
    }>;
  }>;
  isDraft: boolean;
  isVertical: boolean;
}

interface UpdateArtworkFormProps {
  artwork: Artwork;
  onSuccess?: () => void;
}

export function UpdateArtworkForm({
  artwork,
  onSuccess,
}: UpdateArtworkFormProps) {
  const { toast } = useToast();
  const { useUpdate } = useArtworks();

  const isAlreadyPublished = !artwork.isDraft;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<UpdateArtworkFormData>({
    resolver: zodResolver(updateArtworkSchema),
    mode: "onChange",
    defaultValues: {
      koTitle:
        artwork?.translations?.find((t) => t.language === "ko")?.title || "",
      enTitle:
        artwork?.translations?.find((t) => t.language === "en")?.title || "",
      jaTitle:
        artwork?.translations?.find((t) => t.language === "ja")?.title || "",
      createdAt: artwork?.createdAt
        ? new Date(artwork.createdAt).toISOString().split("T")[0]
        : undefined,
      playedOn: (artwork?.playedOn as (typeof Platform)[number]) || undefined,
      rating: artwork?.rating,
      koShortReview:
        artwork?.translations?.find((t) => t.language === "ko")?.shortReview ||
        "",
      enShortReview:
        artwork?.translations?.find((t) => t.language === "en")?.shortReview ||
        "",
      jaShortReview:
        artwork?.translations?.find((t) => t.language === "ja")?.shortReview ||
        "",
      genreIds: artwork?.genres?.map((genre) => genre.id) || [],
    },
  });

  const updateArtworkMutation = useUpdate();

  const onSubmit = async (data: UpdateArtworkFormData) => {
    try {
      await updateArtworkMutation.mutateAsync({
        id: artwork.id,
        data,
      });
      toast({
        title: "작품이 수정되었습니다",
        variant: "success",
      });

      onSuccess?.();
    } catch (error) {
      handleArtworkError(error, toast, "작품 수정 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={updateArtworkMutation.isPending}
      submitText="작품 수정"
      disabled={isAlreadyPublished || !isValid}
    >
      <div className="space-y-4">
        <h3 className="text-sm font-medium">제목(필수)</h3>
        <FormField
          placeholder="작품 제목(한국어)"
          disabled={isAlreadyPublished}
          {...register("koTitle")}
          error={errors.koTitle?.message}
        />
        <FormField
          placeholder="작품 제목(영어)"
          disabled={isAlreadyPublished}
          {...register("enTitle")}
          error={errors.enTitle?.message}
        />
        <FormField
          placeholder="작품 제목(일본어)"
          disabled={isAlreadyPublished}
          {...register("jaTitle")}
          error={errors.jaTitle?.message}
        />
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">게임 정보(임의)</h3>

        <p className="text-sm">
          이미지 방향:{" "}
          <span className="font-bold">
            {artwork.isVertical ? "세로" : "가로"}
          </span>
        </p>

        <FormField
          type="date"
          disabled={isAlreadyPublished}
          {...register("createdAt")}
          error={errors.createdAt?.message}
        />

        <Controller
          name="playedOn"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isAlreadyPublished}
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

        <FormField
          type="number"
          placeholder="평점 (0-20)"
          min={0}
          max={20}
          disabled={isAlreadyPublished}
          {...register("rating", { valueAsNumber: true })}
          error={errors.rating?.message}
        />
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">한줄평(임의)</h3>
        <FormField
          placeholder="한줄평(한국어)"
          disabled={isAlreadyPublished}
          {...register("koShortReview")}
          error={errors.koShortReview?.message}
        />
        <FormField
          placeholder="한줄평(영어)"
          disabled={isAlreadyPublished}
          {...register("enShortReview")}
          error={errors.enShortReview?.message}
        />
        <FormField
          placeholder="한줄평(일본어)"
          disabled={isAlreadyPublished}
          {...register("jaShortReview")}
          error={errors.jaShortReview?.message}
        />
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-sm font-medium">장르(임의)</h3>
        <Controller
          name="genreIds"
          control={control}
          render={({ field }) => (
            <GenreSelect
              value={field.value || []}
              onChange={field.onChange}
              defaultGenres={artwork.genres}
              disabled={isAlreadyPublished}
              error={errors.genreIds?.message}
            />
          )}
        />
      </div>
    </Form>
  );
}
