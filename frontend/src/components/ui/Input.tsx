"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible field label (required for accessibility). */
  label?: string;
  /** Helper text shown below the field when there is no error. */
  helperText?: string;
  /** Error message; when present the field is styled and marked invalid. */
  error?: string;
}

/**
 * Accessible text input with a visible label, helper text, and inline error.
 * Labels are always visible (never placeholder-only) per the form guidelines.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, id, className, required, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedById = error
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-helper`
        : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {required && (
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            "h-11 w-full rounded-md border bg-surface px-3 text-sm text-foreground",
            "placeholder:text-neutral-400 transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70",
            error ? "border-destructive" : "border-input",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
