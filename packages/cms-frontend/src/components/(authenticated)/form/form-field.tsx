import type { ComponentProps } from "react";

import { Input } from "@/src/components/base/input";

interface FormFieldProps extends ComponentProps<typeof Input> {
  error?: string;
}

export function FormField({ error, className, ...props }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Input
        className={className}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
