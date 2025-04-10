import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/base/sheet";
import { cn } from "@/src/lib/utils/tailwindcss/utils";

interface SlideOverProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "default" | "lg";
}

export function SlideOver({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  size = "default",
}: SlideOverProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        className={cn(size === "lg" ? "sm:max-w-md md:max-w-lg" : "")}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
