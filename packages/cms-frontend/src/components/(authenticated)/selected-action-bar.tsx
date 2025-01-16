import { Button } from "@/src/components/base/button";

type ActionButton = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: () => void;
};

interface SelectionActionBarProps {
  selectedCount: number;
  itemLabel?: string;
  actions: ActionButton[];
}

export function SelectionActionBar({
  selectedCount,
  itemLabel = "항목",
  actions,
}: SelectionActionBarProps) {
  return (
    <div className="absolute border-b inset-x-0 top-0 z-50 bg-sidebar backdrop-blur-sm flex justify-center p-4">
      <div className="container flex h-16 items-center justify-between">
        <p className="text-sm font-medium">
          {selectedCount} 개의 {itemLabel} 선택됨
        </p>
        <div className="flex gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant ?? "default"}
                size="sm"
                onClick={action.onClick}
                className="gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
