"use client";

import type { ChangeEvent } from "react";
import { formatLandlineInput, normalizeLandlineInput } from "@/app/src/utils/phone.util";

export function useLandlineInput(value: string, onChange: (value: string) => void) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const entered = input.value;
    let digits = normalizeLandlineInput(entered);
    let digitsBeforeCaret = entered.slice(0, input.selectionStart ?? entered.length).replace(/\D/g, "").length;
    const inputType = (event.nativeEvent as InputEvent).inputType;

    // Deleting a separator also deletes the adjacent digit so backspace never gets stuck.
    if (digits === normalizeLandlineInput(value) && inputType?.startsWith("delete")) {
      const index = inputType === "deleteContentBackward" ? digitsBeforeCaret - 1 : digitsBeforeCaret;
      if (index >= 0) {
        digits = digits.slice(0, index) + digits.slice(index + 1);
        digitsBeforeCaret = index;
      }
    }
    const formatted = formatLandlineInput(digits);
    input.value = formatted;
    onChange(digits);
    let caret = 0;
    let count = 0;
    while (caret < formatted.length && count < digitsBeforeCaret) {
      if (/\d/.test(formatted[caret])) count += 1;
      caret += 1;
    }
    requestAnimationFrame(() => {
      if (document.activeElement === input) input.setSelectionRange(caret, caret);
    });
  }

  return { value: formatLandlineInput(value), onChange: handleChange };
}
