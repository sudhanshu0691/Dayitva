"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface FormFieldProps {
  label?: string;
  name: string;
  error?: string;
  success?: boolean;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  success,
  hint,
  required,
  children,
  className,
  labelClassName,
}) => {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const hintId = `hint-${name}`;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            "block text-sm font-medium text-foreground",
            required && "after:content-['*'] after:text-destructive after:ml-0.5",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: fieldId,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error
                ? errorId
                : hint
                ? hintId
                : undefined,
              className: cn(
                (children as React.ReactElement<any>).props.className,
                error && "border-destructive focus-visible:ring-destructive",
                success && "border-emerald-500 focus-visible:ring-emerald-500"
              ),
            })
          : children}

        {/* Success indicator */}
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        )}

        {/* Error indicator */}
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-destructive flex items-center gap-1"
        >
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p
          id={hintId}
          className="text-xs text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
};

FormField.displayName = "FormField";

/**
 * FormRow - Horizontal layout for form fields
 */
export const FormRow: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 2, className }) => {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[cols], className)}>
      {children}
    </div>
  );
};

/**
 * FormSection - A grouped section with a title
 */
export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="border-t border-border/50 pt-4">{children}</div>
    </div>
  );
};