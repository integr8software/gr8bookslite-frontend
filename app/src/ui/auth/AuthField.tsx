"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "@/app/src/hooks/shared/account/usePasswordVisibility";

type AuthFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  errors?: string[];
  leadingIcon?: ReactNode;
};

export function AuthField({
  label,
  errors,
  id,
  name,
  leadingIcon,
  ...props
}: AuthFieldProps) {
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
        className="mb-2 block text-sm font-semibold text-darknavy"
      >
        {label}
      </label>
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-darknavy/40">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={fieldId}
          name={name}
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          className={`h-12 w-full rounded-lg border border-darknavy/10 bg-offwhite px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 hover:border-skyblue/60 focus:border-skyblue focus:bg-white focus:ring-4 focus:ring-skyblue/15 ${leadingIcon ? "pl-11" : ""} ${isPassword ? "pr-12" : ""}`}
          {...props}
          type={inputType}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-skyblue/40"
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
        <p id={errorId} className="mt-2 text-sm font-medium text-coralpink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
