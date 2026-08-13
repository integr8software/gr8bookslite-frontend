import type { ReactNode } from "react";
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
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

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
        const account = CashAdvanceMultipleEntryAccountOptions.find(
          (option) => option.value === accountCode,
        );

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
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onAddParty: () => void;
  onChange: (partyCode: string, partyName: string) => void;
  optionDisplay?: "code" | "name";
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
      options={createEntryPartyOptions(optionDisplay)}
      placeholder=""
      readOnly={readOnly}
      value={value}
      onChange={(nextValue) => {
        const partyCode = String(nextValue);
        const party = CashAdvanceMultipleEntryPartyOptions.find(
          (option) => option.value === partyCode,
        );

        onChange(partyCode, party?.name ?? "");
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
    <input
      id={id}
      name={name}
      className={CashAdvanceMultipleEntryEntryInputClassName}
      readOnly={readOnly}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function EntryNumberInput(props: Parameters<typeof EntryTextInput>[0]) {
  return <EntryTextInput {...props} />;
}

export function CashAdvanceMultipleEntryFieldShell({
  children,
  controlId,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  controlId?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function createEntryPartyOptions(optionDisplay: "code" | "name"): AppAdvancedDropdownOption[] {
  return CashAdvanceMultipleEntryPartyOptions.map((option) => ({
    description: optionDisplay === "code" ? option.name : undefined,
    label: optionDisplay === "code" ? option.name : option.label,
    name: optionDisplay === "code" ? option.label : option.name,
    value: option.value,
  }));
}
