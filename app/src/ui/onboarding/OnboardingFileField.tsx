import { ImageUp, X } from "lucide-react";

type OnboardingFileFieldProps = {
  id: string;
  name: string;
  label: string;
  fileName: string;
  hint?: string;
  inputKey: number;
  errors?: string[];
  onChange: (file: File | undefined) => void;
  onRemove: () => void;
};

export function OnboardingFileField({
  id,
  name,
  label,
  fileName,
  hint,
  inputKey,
  errors,
  onChange,
  onRemove,
}: OnboardingFileFieldProps) {
  const errorId = `${id}-error`;
  const hasFile = Boolean(fileName);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-darknavy">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex h-14 cursor-pointer overflow-hidden rounded-md border bg-white ${
          errors?.length ? "border-coralpink" : "border-darknavy/20"
        }`}
      >
        <span className="flex w-14 items-center justify-center bg-black text-white">
          <ImageUp className="h-5 w-5" />
        </span>
        <span className="flex flex-1 items-center px-4 text-base text-darknavy/65">
          {fileName || "Upload image"}
        </span>
        {hasFile ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            aria-label="Remove uploaded image"
            className="flex w-12 items-center justify-center text-darknavy/60 transition hover:text-darknavy"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <input
          key={inputKey}
          id={id}
          name={name}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-describedby={errors?.length ? errorId : undefined}
          aria-invalid={errors?.length ? true : undefined}
          onChange={(event) => onChange(event.target.files?.[0])}
        />
      </label>
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm text-coralpink">
          {errors[0]}
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-sm text-darknavy/70">{hint}</p> : null}
    </div>
  );
}
