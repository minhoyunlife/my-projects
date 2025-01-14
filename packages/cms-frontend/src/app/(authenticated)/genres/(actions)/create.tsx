import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { useCreateGenre } from "@/src/hooks/genres/use-genre-create";
import { useToast } from "@/src/hooks/use-toast";
import { handleGenreError } from "@/src/lib/utils/errors/genre";
import {
  createGenreSchema,
  type CreateGenreFormData,
} from "@/src/schemas/genres/create";

export function CreateGenreForm({ onSuccess }: { onSuccess?: () => void }) {
  const createGenreMutation = useCreateGenre();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateGenreFormData>({
    resolver: zodResolver(createGenreSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: CreateGenreFormData) => {
    try {
      await createGenreMutation.mutateAsync(data);
      toast({
        title: "장르가 추가되었습니다",
      });
      reset();

      onSuccess?.();
    } catch (error) {
      handleGenreError(error, toast, "장르 추가 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createGenreMutation.isPending}
      submitText="장르 추가"
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
