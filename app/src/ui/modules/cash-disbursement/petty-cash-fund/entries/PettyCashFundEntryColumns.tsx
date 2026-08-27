import {
  PettyCashFundEntryTypeOptions,
  PettyCashFundEntryEwtCodeOptions,
  PettyCashFundEntryVatTypeOptions,
  PettyCashFundResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { calculatePettyCashFundItemTaxFields } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type {
  PettyCashFundActionPageState,
  PettyCashFundAccountingColumnId,
  PettyCashFundAccountingEntry,
  PettyCashFundItem,
  PettyCashFundItemColumnId,
  PettyCashFundOpenResponsibilityCenterDrawerHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";

export function createPettyCashFundItemColumns(
  page: PettyCashFundActionPageState,
  labels: Record<PettyCashFundItemColumnId, string>,
  widths: Record<PettyCashFundItemColumnId, number>,
  onOpenResponsibilityCenterDrawer?: PettyCashFundOpenResponsibilityCenterDrawerHandler,
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
        placeholder={`Enter ${labels[id]}`}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const money = (
    id: PettyCashFundItemColumnId,
    onChange?: (row: PettyCashFundItem, value: string) => void,
  ): ModuleDataEntryColumn<PettyCashFundItem> => ({
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
        onChange={(value) => (onChange ? onChange(row, value) : page.updateItem(row.id, { [id]: value }))}
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
        placeholder={`Select ${labels[id]}`}
        searchPlaceholder={`Search ${labels[id]}`}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const calculatedMoney = (id: PettyCashFundItemColumnId): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthMode: "fixed",
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={String(row[id] ?? "")} />,
  });

  return {
    date: text("date", "date"),
    payeeCode: text("payeeCode"),
    payeeName: text("payeeName"),
    orNo: text("orNo"),
    tinNo: text("tinNo"),
    remarks: text("remarks"),
    amount: money("amount", (row, value) =>
      page.updateItem(row.id, {
        amount: value,
        ...calculatePettyCashFundItemTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    type: dropdown("type", PettyCashFundEntryTypeOptions),
    vatType: {
      ...dropdown("vatType", PettyCashFundEntryVatTypeOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.vatType}
          readOnly={page.isReadonly}
          options={PettyCashFundEntryVatTypeOptions}
          placeholder="Select VAT Type"
          searchPlaceholder="Search VAT Type"
          onChange={(value) =>
            page.updateItem(row.id, {
              vatType: value,
              ...calculatePettyCashFundItemTaxFields(row.amount, value, row.ewtCode),
            })
          }
        />
      ),
    },
    vatPercent: calculatedMoney("vatPercent"),
    vatAmount: calculatedMoney("vatAmount"),
    ewtCode: {
      ...dropdown("ewtCode", PettyCashFundEntryEwtCodeOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.ewtCode}
          readOnly={page.isReadonly}
          options={PettyCashFundEntryEwtCodeOptions}
          placeholder="Select EWT Code"
          searchPlaceholder="Search EWT Code"
          onChange={(value) =>
            page.updateItem(row.id, {
              ewtCode: value,
              ...calculatePettyCashFundItemTaxFields(row.amount, row.vatType, value),
            })
          }
        />
      ),
    },
    ewtPercent: calculatedMoney("ewtPercent"),
    ewtAmount: calculatedMoney("ewtAmount"),
    netAmount: calculatedMoney("netAmount"),
    totalAmountDue: calculatedMoney("totalAmountDue"),
    grossAmount: money("grossAmount"),
    responsibilityCenterCode: {
      header: labels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: widths.responsibilityCenterCode,
      widthMode: "fixed",
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.responsibilityCenterCode} />,
    },
    responsibilityCenterName: {
      header: labels.responsibilityCenterName,
      id: "responsibilityCenterName",
      width: widths.responsibilityCenterName,
      widthMode: "fixed",
      widthClassName: "w-auto",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.responsibilityCenterCode}
          readOnly={page.isReadonly}
          options={PettyCashFundResponsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          addAction={
            !page.isReadonly && onOpenResponsibilityCenterDrawer
              ? { label: "Add Responsibility Center", onClick: () => onOpenResponsibilityCenterDrawer(row.id) }
              : undefined
          }
          onChange={(value) => {
            const selectedCenter = PettyCashFundResponsibilityCenterOptions.find((option) => option.value === value);
            page.updateItem(row.id, {
              responsibilityCenterCode: String(selectedCenter?.value ?? ""),
              responsibilityCenterName: selectedCenter?.name ?? "",
            });
          }}
        />
      ),
    },
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
