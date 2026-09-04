import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

type FallbackOptionInput = {
  value?: string | null;
  label?: string | null;
  name?: string | null;
  description?: string | null;
};

export function ensureDropdownOption<T extends AppAdvancedDropdownOption>(
  options: T[],
  fallback?: FallbackOptionInput | null,
): T[] {
  if (!fallback) {
    return options;
  }

  const rawValue = fallback.value ?? fallback.label ?? "";
  const value = String(rawValue).trim();
  if (!value) {
    return options;
  }

  const exists = options.some(
    (option) =>
      option.value === value ||
      option.label === value ||
      (Boolean(fallback.label) && option.label === fallback.label) ||
      (Boolean(fallback.name) && option.name === fallback.name),
  );

  if (exists) {
    return options;
  }

  const label = fallback.label ?? value;
  const name = fallback.name ?? label ?? value;
  const description = fallback.description ?? name ?? label;

  const fallbackOption = {
    value,
    label,
    name,
    description,
  } as unknown as T;

  return [fallbackOption, ...options];
}
