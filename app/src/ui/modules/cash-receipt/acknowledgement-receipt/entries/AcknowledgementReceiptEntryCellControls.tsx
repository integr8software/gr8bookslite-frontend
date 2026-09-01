import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { formatAcknowledgementReceiptAmount } from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function AcknowledgementReceiptEntryDropdown({
  onChange,
  options,
  placeholder,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  placeholder: string;
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      className={AcknowledgementReceiptEntryDropdownClassName}
      value={value}
      options={options}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

export function AcknowledgementReceiptEntryInput({
  onChange,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={acknowledgementReceiptEntryCellControlClassName()}
    />
  );
}

export function AcknowledgementReceiptEntryAmountInput({
  onValueChange,
  readOnly,
  value,
}: {
  onValueChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <MoneyNumberField
      value={value}
      readOnly={readOnly}
      onValueChange={onValueChange}
      className={acknowledgementReceiptEntryCellControlClassName("text-right tabular-nums")}
    />
  );
}

export function AcknowledgementReceiptEntryPercentInput({
  onValueChange,
  readOnly,
  value,
}: {
  onValueChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <MoneyNumberField
      value={value}
      readOnly={readOnly}
      onValueChange={onValueChange}
      className={acknowledgementReceiptEntryCellControlClassName("text-right tabular-nums")}
    />
  );
}

export function AcknowledgementReceiptEntryReadOnlyAmount({ value }: { value: number }) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {formatAcknowledgementReceiptAmount(value)}
    </div>
  );
}

function acknowledgementReceiptEntryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

const AcknowledgementReceiptEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
