import { ConfirmDialog } from "@/src/components/(authenticated)/confirm-dialog";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useToast } from "@/src/hooks/use-toast";
import { handleArtworkError } from "@/src/lib/utils/errors/artwork";

interface ChangeArtworkStatusesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  setPublished: boolean;
  onSuccess?: () => void;
}

export function ChangeArtworkStatusesDialog({
  open,
  onOpenChange,
  selectedIds,
  setPublished,
  onSuccess,
}: ChangeArtworkStatusesDialogProps) {
  const { toast } = useToast();
  const { useChangeStatus } = useArtworks();

  const changeArtworkStatusesMutation = useChangeStatus();

  const handleChangeStatus = async () => {
    try {
      await changeArtworkStatusesMutation.mutateAsync({
        ids: new Set(selectedIds),
        setPublished,
      });
      toast({
        title: `작품을 ${setPublished ? "공개" : "비공개"}했습니다`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleArtworkError(error, toast, "작품 상태 변경 중 에러가 발생했습니다");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="작품 상태 변경"
      description={`선택한 ${selectedIds.length}개의 작품을 ${setPublished ? "공개" : "비공개"}하시겠습니까?`}
      confirmLabel="적용"
      variant="destructive"
      onConfirm={handleChangeStatus}
    />
  );
}
