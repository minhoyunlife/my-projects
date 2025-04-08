import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/src/components/(authenticated)/form/form";
import { FormField } from "@/src/components/(authenticated)/form/form-field";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";
import { handleSeriesError } from "@/src/lib/utils/errors/series";
import {
  createSeriesSchema,
  type CreateSeriesFormData,
} from "@/src/schemas/series/create";

export function CreateSeriesForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { useCreate } = useSeries();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateSeriesFormData>({
    resolver: zodResolver(createSeriesSchema),
    mode: "onChange",
  });

  const createSeriesMutation = useCreate();

  const onSubmit = async (data: CreateSeriesFormData) => {
    try {
      await createSeriesMutation.mutateAsync(data);
      toast({
        title: "시리즈가 추가되었습니다",
        variant: "success",
      });
      reset();

      onSuccess?.();
    } catch (error) {
      handleSeriesError(error, toast, "시리즈 추가 중 에러가 발생했습니다");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createSeriesMutation.isPending}
      submitText="시리즈 추가"
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
