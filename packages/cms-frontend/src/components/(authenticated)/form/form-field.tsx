import { forwardRef, type ComponentProps } from "react";

import { Input } from "@/src/components/base/input";

type FormFieldProps = ComponentProps<"input"> & {
  error?: string;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          className={className}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = "FormField";
