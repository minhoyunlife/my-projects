import { cn } from "@/src/lib/utils/tailwindcss/utils";

interface SpinnerProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Spinner({
  size = 24,
  strokeWidth = 4,
  className,
}: SpinnerProps) {
  return (
    <div
      data-testid="spinner"
      className={cn(
        "border-current rounded-full border-solid animate-spin border-t-transparent",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderWidth: strokeWidth,
      }}
    />
  );
}
