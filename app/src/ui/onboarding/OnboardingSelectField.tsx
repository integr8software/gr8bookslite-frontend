import { ChevronDown } from "lucide-react";

type OnboardingSelectFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  options: readonly string[];
  errors?: string[];
  onChange: (value: string) => void;
};

export function OnboardingSelectField({
  id,
  name,
  label,
  value,
  options,
  errors,
  onChange,
}: OnboardingSelectFieldProps) {
  const errorId = `${id}-error`;
  const fieldClassName = `h-14 w-full appearance-none rounded-md border bg-white px-4 pr-12 text-base text-darknavy outline-none transition focus:ring-4 ${errors?.length
    ? "border-coralpink focus:border-coralpink focus:ring-coralpink/20"
    : "border-darknavy/20 focus:border-skyblue focus:ring-skyblue/20"
    }`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-darknavy">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          className={fieldClassName}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-darknavy" />
      </div>
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm text-coralpink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
