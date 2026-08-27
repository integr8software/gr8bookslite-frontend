import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export const moduleDataEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export function ModuleDataEntryDropdownCell({
  addAction,
  className,
  id,
  menuMinWidth,
  name,
  onChange,
  optionViewToggle = false,
  options,
  placeholder = "",
  readOnly,
  searchPlaceholder = "Search Options",
  value,
}: {
  addAction?: { label: string; onClick: () => void };
  className?: string;
  id: string;
  menuMinWidth?: number;
  name: string;
  onChange?: (value: string) => void;
  optionViewToggle?: boolean;
  options: AppAdvancedDropdownOption[];
  placeholder?: string;
  readOnly?: boolean;
  searchPlaceholder?: string;
  value: string | number;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      value={String(value ?? "")}
      readOnly={readOnly}
      options={options}
      optionViewToggle={optionViewToggle}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      addAction={addAction}
      menuMinWidth={menuMinWidth}
      className={`${moduleDataEntryDropdownClassName} ${className ?? ""}`}
      onChange={(nextValue) => onChange?.(String(nextValue ?? ""))}
    />
  );
}
