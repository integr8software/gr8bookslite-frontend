"use client";

import { ImageUp, X } from "lucide-react";

type OnboardingFileFieldProps = {
  id: string;
  name: string;
  label: string;
  fileName: string;
  previewUrl: string;
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
  previewUrl,
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
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex h-12 cursor-pointer overflow-hidden rounded-lg border bg-offwhite transition hover:border-skyblue/60 ${errors?.length ? "border-coralpink" : "border-darknavy/10"
          }`}
      >
        <span className="flex w-12 items-center justify-center bg-darknavy text-white">
          <ImageUp className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-1 items-center px-4 text-sm text-darknavy/60">
          <span className="truncate">{fileName || "Upload image"}</span>
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
      {previewUrl ? (
        <div className="mt-3 rounded-xl border border-darknavy/10 bg-offwhite p-3">
          <div className="relative h-36 w-full overflow-hidden rounded-lg bg-white">
            {/* User-uploaded preview URLs can be blob or backend-hosted values that don't work reliably with next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${label} preview`}
              loading="lazy"
              className="h-full w-full object-contain p-3"
            />
          </div>
        </div>
      ) : null}
      {errors?.length ? (
        <p id={errorId} className="mt-2 text-sm text-coralpink">
          {errors[0]}
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-xs text-darknavy/50">{hint}</p> : null}
    </div>
  );
}
