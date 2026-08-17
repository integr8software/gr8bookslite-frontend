import { RevolvingFundResponsibilityCenterOptions } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type { RevolvingFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import type {
  RevolvingFundAccountingColumnId,
  RevolvingFundAccountingEntry,
  RevolvingFundItem,
  RevolvingFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import {
  RevolvingFundEntryInput,
  RevolvingFundEntrySelect,
} from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntryCellControls";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createRevolvingFundItemColumns(
  page: RevolvingFundActionPageState,
  labels: Record<RevolvingFundItemColumnId, string>,
  widths: Record<RevolvingFundItemColumnId, number>,
): Record<RevolvingFundItemColumnId, ModuleDataEntryColumn<RevolvingFundItem>> {
  const text = (
    id: RevolvingFundItemColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<RevolvingFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <RevolvingFundEntryInput
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id])}
        readOnly={page.isReadonly}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });
  const select = (
    id: RevolvingFundItemColumnId,
    options: readonly string[],
  ): ModuleDataEntryColumn<RevolvingFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <RevolvingFundEntrySelect
        id={context.fieldId}
        name={context.fieldName}
        value={String(row[id])}
        readOnly={page.isReadonly}
        options={options}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });
  return {
    date: text("date", "date"),
    payeeCode: text("payeeCode"),
    payeeName: text("payeeName"),
    orNo: text("orNo"),
    tinNo: text("tinNo"),
    particulars: text("particulars"),
    amount: text("amount"),
    netAmount: text("netAmount"),
    vatAmount: text("vatAmount"),
    type: select("type", ["Expense", "Asset", "Other"]),
    vatType: select("vatType", ["VAT 12%", "Zero Rated", "Exempt"]),
    vatable: select("vatable", ["False", "True"]),
    vatInclusive: select("vatInclusive", ["False", "True"]),
    grossAmount: text("grossAmount"),
    responsibilityCenter: select("responsibilityCenter", RevolvingFundResponsibilityCenterOptions),
  };
}

export function createRevolvingFundAccountingColumns(
  labels: Record<RevolvingFundAccountingColumnId, string>,
  widths: Record<RevolvingFundAccountingColumnId, number>,
): Record<RevolvingFundAccountingColumnId, ModuleDataEntryColumn<RevolvingFundAccountingEntry>> {
  const column = (
    id: RevolvingFundAccountingColumnId,
  ): ModuleDataEntryColumn<RevolvingFundAccountingEntry> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row) => (
      <span className={`block ${id === "debit" || id === "credit" ? "text-right tabular-nums" : ""}`}>
        {row[id]}
      </span>
    ),
  });
  return {
    accountCode: column("accountCode"),
    accountTitle: column("accountTitle"),
    debit: column("debit"),
    credit: column("credit"),
    partyCode: column("partyCode"),
    partyName: column("partyName"),
    particulars: column("particulars"),
  };
}

