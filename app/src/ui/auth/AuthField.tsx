"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "@/app/src/hooks/shared/usePasswordVisibility";

type AuthFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  errors?: string[];
};

export function AuthField({ label, errors, id, name, ...props }: AuthFieldProps) {
  const fieldId = id ?? String(name);
  const errorId = `${fieldId}-error`;
  const {
    isPassword,
    inputType,
    isPasswordVisible,
    togglePasswordVisibility,
  } = usePasswordVisibility(props.type);

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-medium text-darknavy"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          className={`h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/20 ${isPassword ? "pr-12" : ""}`}
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
        ) : null}
      </div>
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm text-coralpink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
