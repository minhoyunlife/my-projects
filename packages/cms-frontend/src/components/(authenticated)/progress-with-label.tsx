import { Progress } from "@/src/components/base/progress";
import { cn } from "@/src/lib/utils/tailwindcss/utils";

interface ProgressWithLabelProps {
  value: number;
  className?: string;
}

export function ProgressWithLabel({
  value,
  className,
}: ProgressWithLabelProps) {
  return (
    <div className={cn("w-full relative h-6", className)}>
      <Progress
        value={value}
        className="w-full h-full"
      />
      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium mix-blend-difference text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
}
