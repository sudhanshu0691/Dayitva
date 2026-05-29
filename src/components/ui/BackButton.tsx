"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";

export interface BackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  label?: string;
  variant?: "icon" | "text" | "full";
}

export const BackButton: React.FC<BackButtonProps> = ({
  href,
  label = "Back",
  variant = "full",
  className,
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
      return;
    }
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center w-9 h-9 rounded-lg",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label={label}
        {...props}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1",
          className
        )}
        {...props}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  // "full" variant
  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "text-sm font-medium text-muted-foreground",
        "border border-border/60 bg-card hover:bg-muted hover:text-foreground",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

BackButton.displayName = "BackButton";