import type { ComponentPropsWithoutRef } from "react";

type AuthFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  errors?: string[];
};

export function AuthField({ label, errors, id, name, ...props }: AuthFieldProps) {
  const fieldId = id ?? String(name);
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-medium text-darknavy"
      >
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-describedby={errors?.length ? errorId : undefined}
        aria-invalid={errors?.length ? true : undefined}
        className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
        {...props}
      />
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm text-coralpink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
