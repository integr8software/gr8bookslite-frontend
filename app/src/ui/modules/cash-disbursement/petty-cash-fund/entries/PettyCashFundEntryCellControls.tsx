import { PettyCashFundEntryInputClassName } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";

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

export function PettyCashFundEntrySelect({
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
  options: readonly string[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={`${PettyCashFundEntryInputClassName} app-select-control`}
    >
      <option value="">Select</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}
