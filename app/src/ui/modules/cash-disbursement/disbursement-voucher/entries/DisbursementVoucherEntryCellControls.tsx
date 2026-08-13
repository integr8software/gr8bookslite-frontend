import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { getDisbursementEntryExportCell } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type { DisbursementEntryColumnId } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MoneyNumberField, formatMoneyNumberInput, parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

export const AccountingDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export function EntryInput({
  disabled = false,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      className={accountingCellControlClassName()}
    />
  );
}

export function ExpenseDetailValue({ suffix = "", value }: { suffix?: string; value: number }) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      {suffix}
    </div>
  );
}

export function ParticularsCell({
  entry,
  isReadonly,
  onOpen,
  onUpdate,
}: {
  entry: DisbursementLineEntry;
  isReadonly: boolean;
  onOpen: () => void;
  onUpdate: (value: string) => void;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
      <EntryInput value={entry.particulars} onChange={onUpdate} readOnly={isReadonly} />
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
        aria-label="Open remarks"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ParticularsEditorDialog({
  entry,
  isReadonly,
  onClose,
  onSave,
}: {
  entry: DisbursementLineEntry | null;
  isReadonly: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  return (
    <ModuleTextareaDialog
      isOpen={Boolean(entry)}
      isReadonly={isReadonly}
      title="Remarks"
      subtitle={entry?.accountName || "Accounting entry"}
      textareaId="disbursement-entry-remarks-dialog-text"
      value={entry?.particulars ?? ""}
      onClose={onClose}
      onSave={onSave}
    />
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
  onChange,
  value,
}: {
  allowNegative?: boolean;
  disabled?: boolean;
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
    <MoneyNumberField
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
  );
}

export function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

export function formatAccountingAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
