import { PettyCashFundResponsibilityCenterOptions } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import type {
  PettyCashFundAccountingColumnId,
  PettyCashFundAccountingEntry,
  PettyCashFundItem,
  PettyCashFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import {
  PettyCashFundEntryInput,
  PettyCashFundEntrySelect,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntryCellControls";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createPettyCashFundItemColumns(
  page: PettyCashFundActionPageState,
  labels: Record<PettyCashFundItemColumnId, string>,
  widths: Record<PettyCashFundItemColumnId, number>,
): Record<PettyCashFundItemColumnId, ModuleDataEntryColumn<PettyCashFundItem>> {
  const text = (
    id: PettyCashFundItemColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <PettyCashFundEntryInput
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
    id: PettyCashFundItemColumnId,
    options: readonly string[],
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <PettyCashFundEntrySelect
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
    responsibilityCenter: select("responsibilityCenter", PettyCashFundResponsibilityCenterOptions),
  };
}

export function createPettyCashFundAccountingColumns(
  labels: Record<PettyCashFundAccountingColumnId, string>,
  widths: Record<PettyCashFundAccountingColumnId, number>,
): Record<PettyCashFundAccountingColumnId, ModuleDataEntryColumn<PettyCashFundAccountingEntry>> {
  const column = (
    id: PettyCashFundAccountingColumnId,
  ): ModuleDataEntryColumn<PettyCashFundAccountingEntry> => ({
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
