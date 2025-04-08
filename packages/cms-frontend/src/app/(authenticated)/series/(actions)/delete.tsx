import { ConfirmDialog } from "@/src/components/(authenticated)/confirm-dialog";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";
import { handleSeriesError } from "@/src/lib/utils/errors/series";

interface DeleteSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess?: () => void;
}

export function DeleteSeriesDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: DeleteSeriesDialogProps) {
  const { toast } = useToast();
  const { useDelete } = useSeries();

  const deleteSeriesMutation = useDelete();

  const handleDelete = async () => {
    try {
      await deleteSeriesMutation.mutateAsync({ ids: new Set(selectedIds) });
      toast({
        title: "시리즈가 삭제되었습니다",
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleSeriesError(error, toast, "시리즈 삭제 중 에러가 발생했습니다");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="시리즈 삭제"
      description={`선택한 ${selectedIds.length}개의 시리즈를 삭제하시겠습니까? 삭제된 시리즈는 복구할 수 없습니다.`}
      confirmLabel="삭제"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
}
