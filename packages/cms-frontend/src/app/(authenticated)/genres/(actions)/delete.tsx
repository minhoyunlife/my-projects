import { ConfirmDialog } from "@/src/components/(authenticated)/confirm-dialog";
import { useGenres } from "@/src/hooks/genres/use-genres";
import { useToast } from "@/src/hooks/use-toast";
import { handleGenreError } from "@/src/lib/utils/errors/genre";

interface DeleteGenresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess?: () => void;
}

export function DeleteGenresDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: DeleteGenresDialogProps) {
  const { toast } = useToast();
  const { useDelete } = useGenres();

  const deleteGenresMutation = useDelete();

  const handleDelete = async () => {
    try {
      await deleteGenresMutation.mutateAsync({ ids: new Set(selectedIds) });
      toast({
        title: "장르가 삭제되었습니다",
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleGenreError(error, toast, "장르 삭제 중 에러가 발생했습니다");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="장르 삭제"
      description={`선택한 ${selectedIds.length}개의 장르를 삭제하시겠습니까? 삭제된 장르는 복구할 수 없습니다.`}
      confirmLabel="삭제"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
}
