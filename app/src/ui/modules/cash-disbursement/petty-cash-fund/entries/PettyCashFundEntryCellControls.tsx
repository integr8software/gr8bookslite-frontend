import { PettyCashFundEntryInputClassName } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function PettyCashFundEntryInput({
  id,
  name,
  onChange,
  readOnly,
  type = "text",
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={PettyCashFundEntryInputClassName}
    />
  );
}

export function PettyCashFundEntryDropdown({
  id,
  name,
  onChange,
  options,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      value={value}
      readOnly={readOnly}
      options={options}
      placeholder=""
      searchPlaceholder="Search Options"
      className={EntryDropdownClassName}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
