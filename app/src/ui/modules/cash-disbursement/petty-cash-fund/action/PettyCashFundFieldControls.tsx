import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function PettyCashFundLookupField({
  addAction,
  onChange,
  options,
  placeholder,
  readOnly,
  searchPlaceholder,
  value,
}: {
  addAction?: { label: string; onClick: () => void };
  onChange: (code: string, name: string) => void;
  options: AppAdvancedDropdownOption[];
  placeholder: string;
  readOnly: boolean;
  searchPlaceholder: string;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      addAction={addAction}
      onChange={(nextValue) => {
        const code = String(nextValue);
        const option = options.find((item) => item.value === code);
        onChange(code, option?.name ?? "");
      }}
      options={options}
      placeholder={placeholder}
      readOnly={readOnly}
      searchPlaceholder={searchPlaceholder}
      value={value}
    />
  );
}
