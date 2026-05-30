import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "muted";
  label?: string;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const variantStyles: Record<string, string> = {
  default: "text-foreground",
  primary: "text-primary",
  muted: "text-muted-foreground",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  label,
  className,
}) => {
  return (
    <div
      role="status"
      aria-label={label || "Loading"}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeStyles[size],
          variantStyles[variant]
        )}
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <span className="sr-only">{label || "Loading"}</span>
    </div>
  );
};

Spinner.displayName = "Spinner";

/**
 * FullPageSpinner - Centered spinner for full page loads
 */
export const FullPageSpinner: React.FC<{ label?: string }> = ({
  label = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Spinner size="xl" variant="primary" />
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
};

/**
 * InlineSpinner - Small inline spinner for buttons
 */
export const InlineSpinner: React.FC = () => {
  return (
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  );
};