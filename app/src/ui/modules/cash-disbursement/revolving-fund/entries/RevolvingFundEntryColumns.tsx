import {
  RevolvingFundEntryTypeOptions,
  RevolvingFundEntryVatTypeOptions,
  RevolvingFundResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundActionPageState,
  RevolvingFundAccountingColumnId,
  RevolvingFundAccountingEntry,
  RevolvingFundItem,
  RevolvingFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryCheckboxCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryCheckboxCell";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";

export function createRevolvingFundItemColumns(
  page: RevolvingFundActionPageState,
  labels: Record<RevolvingFundItemColumnId, string>,
  widths: Record<RevolvingFundItemColumnId, number>,
): Record<RevolvingFundItemColumnId, ModuleDataEntryColumn<RevolvingFundItem>> {
  const text = (id: RevolvingFundItemColumnId, type: "text" | "date" = "text"): ModuleDataEntryColumn<RevolvingFundItem> => ({
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
        placeholder={`Enter ${labels[id]}`}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const money = (id: RevolvingFundItemColumnId): ModuleDataEntryColumn<RevolvingFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        placeholder="0.00"
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const dropdown = (
    id: RevolvingFundItemColumnId,
    options: AppAdvancedDropdownOption[],
  ): ModuleDataEntryColumn<RevolvingFundItem> => ({
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
        placeholder={`Select ${labels[id]}`}
        searchPlaceholder={`Search ${labels[id]}`}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const checkbox = (id: "vatable" | "vatInclusive"): ModuleDataEntryColumn<RevolvingFundItem> => ({
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
    amount: money("amount"),
    netAmount: money("netAmount"),
    vatAmount: money("vatAmount"),
    type: dropdown("type", RevolvingFundEntryTypeOptions),
    vatType: dropdown("vatType", RevolvingFundEntryVatTypeOptions),
    vatable: checkbox("vatable"),
    vatInclusive: checkbox("vatInclusive"),
    grossAmount: money("grossAmount"),
    responsibilityCenter: dropdown("responsibilityCenter", RevolvingFundResponsibilityCenterOptions),
  };
}

export function createRevolvingFundAccountingColumns(
  labels: Record<RevolvingFundAccountingColumnId, string>,
  widths: Record<RevolvingFundAccountingColumnId, number>,
): Record<RevolvingFundAccountingColumnId, ModuleDataEntryColumn<RevolvingFundAccountingEntry>> {
  const column = (id: RevolvingFundAccountingColumnId): ModuleDataEntryColumn<RevolvingFundAccountingEntry> => ({
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
