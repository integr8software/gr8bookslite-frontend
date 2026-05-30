"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "@/app/src/hooks/shared/account/usePasswordVisibility";

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
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          className={`h-12 w-full rounded-md border border-slate-200 bg-white/82 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 ${isPassword ? "pr-12" : ""}`}
          {...props}
          type={inputType}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-300"
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
