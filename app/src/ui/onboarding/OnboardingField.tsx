"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "@/app/src/hooks/shared/account/usePasswordVisibility";

type OnboardingFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  errors?: string[];
  endAdornment?: ReactNode;
};

export function OnboardingField({
  label,
  errors,
  id,
  name,
  className,
  endAdornment,
  ...props
}: OnboardingFieldProps) {
  const fieldId = id ?? String(name);
  const errorId = `${fieldId}-error`;
  const {
    isPassword,
    inputType,
    isPasswordVisible,
    togglePasswordVisibility,
  } = usePasswordVisibility(props.type);
  const fieldClassName =
    `h-12 w-full rounded-lg border bg-offwhite px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 hover:border-skyblue/60 focus:bg-white focus:ring-4 ${
      errors?.length
        ? "border-coralpink focus:border-coralpink focus:ring-coralpink/20"
        : "border-darknavy/10 focus:border-skyblue focus:ring-skyblue/15"
    } ${isPassword || endAdornment ? "pr-16" : ""} ${className ?? ""}`.trim();

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-semibold text-darknavy"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          className={fieldClassName}
          {...props}
          type={inputType}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-darknavy/55 transition hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-skyblue/30"
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : endAdornment ? (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm font-medium text-coralpink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
