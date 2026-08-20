import {
  RevolvingFundEntryDropdownClassName,
  RevolvingFundEntryInputClassName,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function RevolvingFundEntryInput({
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
    <>
      <label htmlFor={id} className="sr-only">{name}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={RevolvingFundEntryInputClassName}
      />
    </>
  );
}

export function RevolvingFundEntryDropdown({
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
      className={RevolvingFundEntryDropdownClassName}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}
