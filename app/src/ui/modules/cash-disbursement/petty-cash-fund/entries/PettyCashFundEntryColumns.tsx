import {
  PettyCashFundEntryTypeOptions,
  PettyCashFundEntryVatTypeOptions,
  PettyCashFundResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundActionPageState,
  PettyCashFundAccountingColumnId,
  PettyCashFundAccountingEntry,
  PettyCashFundItem,
  PettyCashFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryCheckboxCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryCheckboxCell";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";

export function createPettyCashFundItemColumns(
  page: PettyCashFundActionPageState,
  labels: Record<PettyCashFundItemColumnId, string>,
  widths: Record<PettyCashFundItemColumnId, number>,
): Record<PettyCashFundItemColumnId, ModuleDataEntryColumn<PettyCashFundItem>> {
  const text = (id: PettyCashFundItemColumnId, type: "text" | "date" = "text"): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryInputCell
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id])}
        readOnly={page.isReadonly}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const dropdown = (
    id: PettyCashFundItemColumnId,
    options: AppAdvancedDropdownOption[],
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryDropdownCell
        id={context.fieldId}
        name={context.fieldName}
        value={String(row[id])}
        readOnly={page.isReadonly}
        options={options}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const checkbox = (id: "vatable" | "vatInclusive"): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, index, context) => (
      <ModuleDataEntryCheckboxCell
        checked={row[id] === "True"}
        inputId={context.fieldId}
        inputName={context.fieldName}
        isReadonly={page.isReadonly}
        label={`${labels[id]} for row ${index + 1}`}
        onChange={(checked) => page.updateItem(row.id, { [id]: checked ? "True" : "False" })}
      />
    ),
  });

  return {
    date: text("date", "date"),
    payeeCode: text("payeeCode"),
    payeeName: text("payeeName"),
    orNo: text("orNo"),
    tinNo: text("tinNo"),
    remarks: text("remarks"),
    amount: text("amount"),
    netAmount: text("netAmount"),
    vatAmount: text("vatAmount"),
    type: dropdown("type", PettyCashFundEntryTypeOptions),
    vatType: dropdown("vatType", PettyCashFundEntryVatTypeOptions),
    vatable: checkbox("vatable"),
    vatInclusive: checkbox("vatInclusive"),
    grossAmount: text("grossAmount"),
    responsibilityCenter: dropdown("responsibilityCenter", PettyCashFundResponsibilityCenterOptions),
  };
}

export function createPettyCashFundAccountingColumns(
  labels: Record<PettyCashFundAccountingColumnId, string>,
  widths: Record<PettyCashFundAccountingColumnId, number>,
): Record<PettyCashFundAccountingColumnId, ModuleDataEntryColumn<PettyCashFundAccountingEntry>> {
  const column = (id: PettyCashFundAccountingColumnId): ModuleDataEntryColumn<PettyCashFundAccountingEntry> => ({
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
    remarks: column("remarks"),
  };
}
