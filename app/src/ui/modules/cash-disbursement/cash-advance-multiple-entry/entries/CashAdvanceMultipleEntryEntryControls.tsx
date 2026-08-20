import {
  CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceMultipleEntryEntryDropdownClassName,
  CashAdvanceMultipleEntryEntryInputClassName,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  CashAdvanceMultipleEntryPartyOptions,
  createCashAdvanceMultipleEntrySelectOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { CashAdvanceEmployeeOption } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export function EntryAccountDropdown({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (accountCode: string, accountTitle: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      className={CashAdvanceMultipleEntryEntryDropdownClassName}
      options={createCashAdvanceMultipleEntrySelectOptions(CashAdvanceMultipleEntryAccountOptions)}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => {
        const accountCode = String(nextValue);
        const account = CashAdvanceMultipleEntryAccountOptions.find((option) => option.value === accountCode);

        onChange(accountCode, account?.label ?? "");
      }}
    />
  );
}

export function EntryPartyDropdown({
  id,
  name,
  onAddParty,
  onChange,
  optionDisplay = "name",
  options,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onAddParty: () => void;
  onChange: (partyCode: string, partyName: string, cashAdvanceBalance: string) => void;
  optionDisplay?: "code" | "name";
  options?: CashAdvanceEmployeeOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      addAction={
        !readOnly
          ? {
              label: "Add Party Name",
              onClick: onAddParty,
            }
          : undefined
      }
      className={CashAdvanceMultipleEntryEntryDropdownClassName}
      options={createEntryPartyOptions(optionDisplay, options)}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => {
        const partyCode = String(nextValue);
        const employee = options?.find((option) => option.partyCode === partyCode);
        const party = CashAdvanceMultipleEntryPartyOptions.find((option) => option.value === partyCode);

        onChange(partyCode, employee?.partyName ?? party?.name ?? "", employee?.cashAdvanceBalance ?? "");
      }}
    />
  );
}

export function EntryDropdown({
  addActionLabel,
  id,
  name,
  onAddAction,
  onChange,
  options,
  readOnly,
  value,
}: {
  addActionLabel?: string;
  id: string;
  name: string;
  onAddAction?: () => void;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      id={id}
      name={name}
      addAction={
        addActionLabel && onAddAction && !readOnly
          ? {
              label: addActionLabel,
              onClick: onAddAction,
            }
          : undefined
      }
      className={CashAdvanceMultipleEntryEntryDropdownClassName}
      options={options}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

export function EntryTextInput({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{name}</label>
      <input id={id} name={name} className={CashAdvanceMultipleEntryEntryInputClassName} readOnly={readOnly} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}

export function EntryNumberInput(props: Parameters<typeof EntryTextInput>[0]) {
  return <EntryTextInput {...props} />;
}

export function EntryMoneyNumberInput({ id, name, readOnly, value }: Omit<Parameters<typeof EntryTextInput>[0], "onChange">) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{name}</label>
      <MoneyNumberField id={id} name={name} className={`${CashAdvanceMultipleEntryEntryInputClassName} text-right tabular-nums`} readOnly={readOnly} value={value} onValueChange={() => undefined} />
    </>
  );
}

function createEntryPartyOptions(
  optionDisplay: "code" | "name",
  employeeOptions?: CashAdvanceEmployeeOption[],
): AppAdvancedDropdownOption[] {
  const options = employeeOptions?.length
    ? employeeOptions.map((employee) => ({
        label: employee.partyCode,
        name: employee.partyName,
        value: employee.partyCode,
      }))
    : CashAdvanceMultipleEntryPartyOptions;

  return options.map((option) => ({
    description: optionDisplay === "code" ? option.name : undefined,
    label: optionDisplay === "code" ? option.name : option.label,
    name: optionDisplay === "code" ? option.label : option.name,
    value: option.value,
  }));
}
