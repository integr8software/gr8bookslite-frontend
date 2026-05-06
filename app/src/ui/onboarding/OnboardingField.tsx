import type { ComponentPropsWithoutRef } from "react";

type OnboardingFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  errors?: string[];
};

export function OnboardingField({
  label,
  errors,
  id,
  name,
  className,
  ...props
}: OnboardingFieldProps) {
  const fieldId = id ?? String(name);
  const errorId = `${fieldId}-error`;
  const fieldClassName = `h-14 w-full rounded-md border bg-white px-4 text-base text-darknavy outline-none transition focus:ring-4 ${
    errors?.length
      ? "border-coralpink focus:border-coralpink focus:ring-coralpink/20"
      : "border-darknavy/20 focus:border-skyblue focus:ring-skyblue/20"
  } ${className ?? ""}`.trim();

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
        className={fieldClassName}
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
