import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export const moduleDataEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export function ModuleDataEntryDropdownCell({
  addAction,
  className,
  id,
  isInvalid = false,
  isWarning = false,
  menuMinWidth,
  name,
  onChange,
  optionViewToggle = false,
  options,
  placeholder = "",
  readOnly,
  searchPlaceholder = "Search Options",
  title,
  value,
}: {
  addAction?: { label: string; onClick: () => void };
  className?: string;
  id: string;
  isInvalid?: boolean;
  isWarning?: boolean;
  menuMinWidth?: number;
  name: string;
  onChange?: (value: string) => void;
  optionViewToggle?: boolean;
  options: AppAdvancedDropdownOption[];
  placeholder?: string;
  readOnly?: boolean;
  searchPlaceholder?: string;
  title?: string;
  value: string | number;
}) {
  const statusClass = isInvalid
    ? "[&_.app-advanced-dropdown-control]:bg-coralpink/10 [&_.app-advanced-dropdown-control]:text-coralpink [&_.app-advanced-dropdown-control]:ring-2 [&_.app-advanced-dropdown-control]:ring-inset [&_.app-advanced-dropdown-control]:ring-coralpink/50 [&_.app-advanced-dropdown-control]:focus:bg-coralpink/10 [&_.app-advanced-dropdown-control]:focus:ring-coralpink/60"
    : isWarning
      ? "[&_.app-advanced-dropdown-control]:bg-amber-500/10 [&_.app-advanced-dropdown-control]:text-darknavy [&_.app-advanced-dropdown-control]:ring-2 [&_.app-advanced-dropdown-control]:ring-inset [&_.app-advanced-dropdown-control]:ring-amber-400 [&_.app-advanced-dropdown-control]:focus:bg-amber-500/10 [&_.app-advanced-dropdown-control]:focus:ring-amber-500"
      : "";

  return (
    <div title={title} className="w-full">
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
        className={`${moduleDataEntryDropdownClassName} ${statusClass} ${className ?? ""}`}
        onChange={(nextValue) => onChange?.(String(nextValue ?? ""))}
      />
    </div>
  );
}
