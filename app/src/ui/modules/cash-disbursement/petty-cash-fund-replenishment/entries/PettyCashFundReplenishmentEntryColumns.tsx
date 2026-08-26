import type {
  PettyCashFundReplenishmentAccountingEntryColumnsParams,
  PettyCashFundReplenishmentAccountingColumnId,
  PettyCashFundReplenishmentAccountingEntry,
  PettyCashFundReplenishmentDetailEntryColumnsParams,
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";

export function createPettyCashFundReplenishmentLineColumns({
  columnLabels,
  columnWidths,
  page,
}: PettyCashFundReplenishmentDetailEntryColumnsParams): Record<
  PettyCashFundReplenishmentEntryColumnId,
  ModuleDataEntryColumn<PettyCashFundReplenishmentEntry>
> {
  const text = (
    id: PettyCashFundReplenishmentEntryColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryInputCell
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id])}
        readOnly={page.isReadonly}
        placeholder={`Enter ${columnLabels[id]}`}
        onChange={(value) => page.updateEntry(row.id, { [id]: value })}
      />
    ),
  });

  const money = (id: "totalAmount" | "netAmount" | "vatAmount"): ModuleDataEntryColumn<PettyCashFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        onChange={(value) => page.updateEntry(row.id, { [id]: value })}
      />
    ),
  });

  return {
    pettyCashDate: text("pettyCashDate", "date"),
    pettyCashNo: text("pettyCashNo"),
    accountCode: text("accountCode"),
    accountTitle: text("accountTitle"),
    totalAmount: money("totalAmount"),
    netAmount: money("netAmount"),
    vatAmount: money("vatAmount"),
    remarks: {
      header: columnLabels.remarks,
      id: "remarks",
      width: columnWidths.remarks,
      widthClassName: "w-auto",
      widthMode: "fixed",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={page.isReadonly}
          value={row.remarks}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => page.updateEntry(row.id, { remarks: value })}
        />
      ),
    },
  };
}

export function createPettyCashFundReplenishmentAccountingColumns({
  columnLabels,
  columnWidths,
}: PettyCashFundReplenishmentAccountingEntryColumnsParams): Record<
  PettyCashFundReplenishmentAccountingColumnId,
  ModuleDataEntryColumn<PettyCashFundReplenishmentAccountingEntry>
> {
  const column = (id: PettyCashFundReplenishmentAccountingColumnId): ModuleDataEntryColumn<PettyCashFundReplenishmentAccountingEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    widthMode: "fixed",
    renderCell: (row) => (
      <span className={`block px-3 ${id === "debit" || id === "credit" ? "text-right tabular-nums" : ""}`}>{row[id]}</span>
    ),
  });

  return {
    accountCode: column("accountCode"),
    accountTitle: column("accountTitle"),
    debit: column("debit"),
    credit: column("credit"),
    partyCode: column("partyCode"),
    partyName: column("partyName"),
    remarks: column("remarks"),
  };
}
