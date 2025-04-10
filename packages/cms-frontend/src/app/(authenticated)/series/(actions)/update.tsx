import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";
import { handleSeriesError } from "@/src/lib/utils/errors/series";
import {
  updateSeriesSchema,
  type UpdateSeriesFormData,
} from "@/src/schemas/series/update";

export interface SeriesArtwork {
  id: string;
  order: number;
  translations: Array<{
    language: string;
    title: string;
  }>;
}

export interface Series {
  id: string;
  translations: Array<{
    language: string;
    title: string;
  }>;
  seriesArtworks: Array<SeriesArtwork>;
}

interface UpdateSeriesFormProps {
  series: Series;
  onSuccess?: () => void;
}

export function UpdateSeriesForm({ series, onSuccess }: UpdateSeriesFormProps) {
  const { toast } = useToast();
  const { useUpdate } = useSeries();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UpdateSeriesFormData>({
    resolver: zodResolver(updateSeriesSchema),
    mode: "onChange",
    defaultValues: {
      koTitle:
        series?.translations?.find((t) => t.language === "ko")?.title || "",
      enTitle:
        series?.translations?.find((t) => t.language === "en")?.title || "",
      jaTitle:
        series?.translations?.find((t) => t.language === "ja")?.title || "",
    },
  });

  const updateSeriesMutation = useUpdate();

  const onSubmit = async (data: UpdateSeriesFormData) => {
    try {
      await updateSeriesMutation.mutateAsync({
        id: series.id,
        data,
      });
      toast({
        title: "시리즈가 수정되었습니다",
        variant: "success",
      });

      onSuccess?.();
    } catch (error) {
      handleSeriesError(error, toast, "시리즈 수정 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={updateSeriesMutation.isPending}
      submitText="시리즈 수정"
      disabled={!isValid}
    >
      <FormField
        placeholder="한국어 시리즈 제목"
        {...register("koTitle")}
        error={errors.koTitle?.message}
      />
      <FormField
        placeholder="English series title"
        {...register("enTitle")}
        error={errors.enTitle?.message}
      />
      <FormField
        placeholder="シリーズタイトル"
        {...register("jaTitle")}
        error={errors.jaTitle?.message}
      />

      {errors.root?.message && (
        <p className="text-sm text-destructive mt-2">{errors.root.message}</p>
      )}
    </Form>
  );
}
