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
  value: string;
};

export function AppLimitedTextarea({
  counterClassName = "mt-1 block text-xs text-darknavy/45",
  counterMode = "remaining",
  maxLength = AppLimitedTextareaMaxLength,
  showCounter = true,
  value,
  ...textareaProps
}: AppLimitedTextareaProps) {
  const remainingCharacters = Math.max(0, maxLength - value.length);
  const counterText =
    counterMode === "used"
      ? `${value.length}/${maxLength} characters`
      : `Characters remaining: ${remainingCharacters}`;

  return (
    <>
      <textarea {...textareaProps} value={value} maxLength={maxLength} />
      {showCounter ? <span className={counterClassName}>{counterText}</span> : null}
    </>
  );
}
