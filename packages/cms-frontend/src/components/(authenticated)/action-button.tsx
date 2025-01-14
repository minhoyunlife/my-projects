import { Plus, Pencil, Trash } from "lucide-react";

import { Button, type ButtonProps } from "@/src/components/base/button";

type ActionType = "add" | "edit" | "delete";

interface ActionButtonProps extends Omit<ButtonProps, "children"> {
  action: ActionType;
  children?: React.ReactNode;
}

const actionIcons = {
  add: Plus,
  edit: Pencil,
  delete: Trash,
} as const;

export function ActionButton({
  action,
  children,
  className,
  ...props
}: ActionButtonProps) {
  const Icon = actionIcons[action];

  return (
    <Button
      className={className}
      {...props}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
