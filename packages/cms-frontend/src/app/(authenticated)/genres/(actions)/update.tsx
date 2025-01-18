import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { useGenres } from "@/src/hooks/genres/use-genres";
import { useToast } from "@/src/hooks/use-toast";
import { handleGenreError } from "@/src/lib/utils/errors/genre";
import {
  updateGenreSchema,
  type UpdateGenreFormData,
} from "@/src/schemas/genres/update";

export interface Genre {
  id: string;
  translations: Array<{
    language: "ko" | "en" | "ja";
    name: string;
  }>;
}

interface UpdateGenreFormProps {
  genre: Genre;
  onSuccess?: () => void;
}

export function UpdateGenreForm({ genre, onSuccess }: UpdateGenreFormProps) {
  const { toast } = useToast();
  const { useUpdate } = useGenres();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UpdateGenreFormData>({
    resolver: zodResolver(updateGenreSchema),
    mode: "onChange",
    defaultValues: {
      koName: genre?.translations?.find((t) => t.language === "ko")?.name || "",
      enName: genre?.translations?.find((t) => t.language === "en")?.name || "",
      jaName: genre?.translations?.find((t) => t.language === "ja")?.name || "",
    },
  });

  const updateGenreMutation = useUpdate();

  const onSubmit = async (data: UpdateGenreFormData) => {
    try {
      await updateGenreMutation.mutateAsync({
        id: genre.id,
        data,
      });
      toast({
        title: "장르가 수정되었습니다",
        variant: "success",
      });

      onSuccess?.();
    } catch (error) {
      handleGenreError(error, toast, "장르 수정 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={updateGenreMutation.isPending}
      submitText="장르 수정"
      disabled={!isValid}
    >
      <FormField
        placeholder="한국어 장르명"
        {...register("koName")}
        error={errors.koName?.message}
      />
      <FormField
        placeholder="English genre name"
        {...register("enName")}
        error={errors.enName?.message}
      />
      <FormField
        placeholder="ジャンル名"
        {...register("jaName")}
        error={errors.jaName?.message}
      />

      {errors.root?.message && (
        <p className="text-sm text-destructive mt-2">{errors.root.message}</p>
      )}
    </Form>
  );
}
