"use client";

import type { TextareaHTMLAttributes } from "react";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";

export const AppLimitedTextareaMaxLength = 500;
export const AppLimitedTextareaDefaultPlaceholder = "Enter a description or notes if needed...";
export const AppLimitedTextareaDefaultClassName =
  "min-h-24 w-full rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";

type AppLimitedTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "maxLength" | "value"
> & {
  counterClassName?: string;
  counterMode?: "remaining" | "used";
  maxLength?: number;
  showCounter?: boolean;
  value?: string | number | null;
};

export function AppLimitedTextarea({
  counterClassName = "mt-1 block text-xs text-darknavy/45",
  counterMode = "remaining",
  maxLength = AppLimitedTextareaMaxLength,
  placeholder,
  showCounter = true,
  value,
  ...textareaProps
}: AppLimitedTextareaProps) {
  const isReadOnly = textareaProps.readOnly;
  const resolvedPlaceholder =
    placeholder !== undefined
      ? placeholder
      : isReadOnly
        ? "No description"
        : AppLimitedTextareaDefaultPlaceholder;
  const textareaValue = value == null ? "" : String(value);
  const remainingCharacters = Math.max(0, maxLength - textareaValue.length);
  const counterText =
    counterMode === "used"
      ? `${textareaValue.length}/${maxLength} characters`
      : `Characters remaining: ${remainingCharacters}`;

  return (
    <>
      <textarea
        {...textareaProps}
        placeholder={resolvedPlaceholder}
        value={textareaValue}
        maxLength={maxLength}
        className={joinClasses(AppLimitedTextareaDefaultClassName, textareaProps.className)}
      />
      {showCounter ? <span className={counterClassName}>{counterText}</span> : null}
    </>
  );
}
