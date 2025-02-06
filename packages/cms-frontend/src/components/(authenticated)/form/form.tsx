import type { ReactNode } from "react";

import { Button } from "@/src/components/base/button";
import { Spinner } from "@/src/components/common/spinner";

interface FormProps {
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  submitText?: string;
  children: ReactNode;
  disabled?: boolean;
}

export function Form({
  onSubmit,
  isSubmitting = false,
  submitText = "확인",
  children,
  disabled = false,
}: FormProps) {
  return (
    <form
      role="form"
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {children}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          className="w-full"
        >
          {isSubmitting ? <Spinner /> : submitText}
        </Button>
      </div>
    </form>
  );
}
