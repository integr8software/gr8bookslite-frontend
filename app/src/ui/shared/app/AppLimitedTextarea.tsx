"use client";

import type { TextareaHTMLAttributes } from "react";

export const AppLimitedTextareaMaxLength = 500;

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
  showCounter = true,
  value,
  ...textareaProps
}: AppLimitedTextareaProps) {
  const textareaValue = value == null ? "" : String(value);
  const remainingCharacters = Math.max(0, maxLength - textareaValue.length);
  const counterText =
    counterMode === "used"
      ? `${textareaValue.length}/${maxLength} characters`
      : `Characters remaining: ${remainingCharacters}`;

  return (
    <>
      <textarea {...textareaProps} value={textareaValue} maxLength={maxLength} />
      {showCounter ? <span className={counterClassName}>{counterText}</span> : null}
    </>
  );
}
