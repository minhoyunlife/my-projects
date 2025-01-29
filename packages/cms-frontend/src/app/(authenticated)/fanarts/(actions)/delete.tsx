import { ConfirmDialog } from "@/src/components/(authenticated)/confirm-dialog";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useToast } from "@/src/hooks/use-toast";
import { handleArtworkError } from "@/src/lib/utils/errors/artwork";

interface DeleteArtworksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess?: () => void;
}

export function DeleteArtworkDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: DeleteArtworksDialogProps) {
  const { toast } = useToast();
  const { useDelete } = useArtworks();

  const deleteArtworkMutation = useDelete();

  const handleDelete = async () => {
    try {
      await deleteArtworkMutation.mutateAsync({ ids: new Set(selectedIds) });
      toast({
        title: "작품이 삭제되었습니다",
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleArtworkError(error, toast, "작품 삭제 중 에러가 발생했습니다");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="작품 삭제"
      description={`선택한 ${selectedIds.length}개의 작품을 삭제하시겠습니까? 삭제된 작품은 복구할 수 없습니다.`}
      confirmLabel="삭제"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
}
