"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  /** Optional placeholder shown as a disabled first option. */
  placeholder?: string;
}

/** Accessible native select with visible label, helper text, and inline error. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, error, options, placeholder, id, className, required, disabled, value, defaultValue, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedById = error
      ? `${selectId}-error`
      : helperText
        ? `${selectId}-helper`
        : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
            {required && (
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedById}
            value={value}
            defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
            className={cn(
              "h-11 w-full appearance-none rounded-md border bg-surface pl-3 pr-10 text-sm text-foreground",
              "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70",
              error ? "border-destructive" : "border-input",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
