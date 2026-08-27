import {
  RevolvingFundEntryTypeOptions,
  RevolvingFundEntryEwtCodeOptions,
  RevolvingFundEntryVatTypeOptions,
  RevolvingFundResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { calculateRevolvingFundItemTaxFields } from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type {
  RevolvingFundActionPageState,
  RevolvingFundAccountingColumnId,
  RevolvingFundAccountingEntry,
  RevolvingFundItem,
  RevolvingFundItemColumnId,
  RevolvingFundOpenResponsibilityCenterDrawerHandler,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";

export function createRevolvingFundItemColumns(
  page: RevolvingFundActionPageState,
  labels: Record<RevolvingFundItemColumnId, string>,
  widths: Record<RevolvingFundItemColumnId, number>,
  onOpenResponsibilityCenterDrawer?: RevolvingFundOpenResponsibilityCenterDrawerHandler,
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

  const money = (
    id: RevolvingFundItemColumnId,
    onChange?: (row: RevolvingFundItem, value: string) => void,
  ): ModuleDataEntryColumn<RevolvingFundItem> => ({
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

  const calculatedMoney = (id: RevolvingFundItemColumnId): ModuleDataEntryColumn<RevolvingFundItem> => ({
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
        ...calculateRevolvingFundItemTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    type: dropdown("type", RevolvingFundEntryTypeOptions),
    vatType: {
      ...dropdown("vatType", RevolvingFundEntryVatTypeOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.vatType}
          readOnly={page.isReadonly}
          options={RevolvingFundEntryVatTypeOptions}
          placeholder="Select VAT Type"
          searchPlaceholder="Search VAT Type"
          onChange={(value) =>
            page.updateItem(row.id, {
              vatType: value,
              ...calculateRevolvingFundItemTaxFields(row.amount, value, row.ewtCode),
            })
          }
        />
      ),
    },
    vatPercent: calculatedMoney("vatPercent"),
    vatAmount: calculatedMoney("vatAmount"),
    ewtCode: {
      ...dropdown("ewtCode", RevolvingFundEntryEwtCodeOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.ewtCode}
          readOnly={page.isReadonly}
          options={RevolvingFundEntryEwtCodeOptions}
          placeholder="Select EWT Code"
          searchPlaceholder="Search EWT Code"
          onChange={(value) =>
            page.updateItem(row.id, {
              ewtCode: value,
              ...calculateRevolvingFundItemTaxFields(row.amount, row.vatType, value),
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
          options={RevolvingFundResponsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          addAction={
            !page.isReadonly && onOpenResponsibilityCenterDrawer
              ? { label: "Add Responsibility Center", onClick: () => onOpenResponsibilityCenterDrawer(row.id) }
              : undefined
          }
          onChange={(value) => {
            const selectedCenter = RevolvingFundResponsibilityCenterOptions.find((option) => option.value === value);
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
