import { useState } from "react";
import { getDisbursementEntryExportCell } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type { DisbursementEntryColumnId } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MoneyNumberField, formatMoneyNumberInput, parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { formatAmount } from "@/app/src/utils/currency.util";

export function EntryInput({
  disabled = false,
  id,
  label,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className={accountingCellControlClassName()}
      />
    </>
  );
}

export function ExpenseDetailValue({ suffix = "", value }: { suffix?: string; value: number }) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {formatAmount(value)}
      {suffix}
    </div>
  );
}

export function calculateDisbursementEntryColumnFitWidth({
  columnId,
  columnLabels,
  entries,
}: {
  columnId: DisbursementEntryColumnId;
  columnLabels: Record<DisbursementEntryColumnId, string>;
  entries: DisbursementLineEntry[];
}) {
  const headerWidth = estimateDisbursementEntryTextWidth(columnLabels[columnId], 76);
  const contentWidth = entries.reduce(
    (currentWidth, entry) =>
      Math.max(currentWidth, estimateDisbursementEntryTextWidth(String(getDisbursementEntryExportCell(entry, columnId) ?? ""), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function estimateDisbursementEntryTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

export function EntryNumberInput({
  allowNegative = false,
  disabled = false,
  id,
  label,
  onChange,
  value,
}: {
  allowNegative?: boolean;
  disabled?: boolean;
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing ? draftValue : value !== 0 ? formatMoneyNumberInput(String(value), allowNegative) : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <>
      <label htmlFor={id} className="sr-only">{label}</label>
      <MoneyNumberField
        id={id}
        allowNegative={allowNegative}
        value={displayValue}
        onValueChange={handleValueChange}
        onFocus={() => {
          setDraftValue(displayValue);
          setIsEditing(true);
        }}
        onBlur={() => {
          setDraftValue("");
          setIsEditing(false);
        }}
        disabled={disabled}
        className={accountingCellControlClassName("text-right")}
      />
    </>
  );
}

export function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}
