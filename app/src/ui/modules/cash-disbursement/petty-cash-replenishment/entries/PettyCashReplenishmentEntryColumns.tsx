import type {
  PettyCashReplenishmentAccountingEntryColumnsParams,
  PettyCashReplenishmentAccountingColumnId,
  PettyCashReplenishmentAccountingEntry,
  PettyCashReplenishmentDetailEntryColumnsParams,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import {
  PettyCashReplenishmentEntryEwtCodeOptions,
  PettyCashReplenishmentEntryVatTypeOptions,
  PettyCashReplenishmentResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { calculatePettyCashReplenishmentEntryTaxFields } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export function createPettyCashReplenishmentLineColumns({
  columnLabels,
  columnWidths,
  onOpenSupplierDrawer,
  page,
  supplierOptions = [],
}: PettyCashReplenishmentDetailEntryColumnsParams): Record<
  PettyCashReplenishmentEntryColumnId,
  ModuleDataEntryColumn<PettyCashReplenishmentEntry>
> {
  const text = (
    id: PettyCashReplenishmentEntryColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<PettyCashReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
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

  const money = (
    id: PettyCashReplenishmentEntryColumnId,
    onChange?: (row: PettyCashReplenishmentEntry, value: string) => void,
  ): ModuleDataEntryColumn<PettyCashReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        placeholder="0.00"
        onChange={(value) => (onChange ? onChange(row, value) : page.updateEntry(row.id, { [id]: value }))}
      />
    ),
  });

  const dropdown = (
    id: "vatType" | "ewtCode",
    options: AppAdvancedDropdownOption[],
  ): ModuleDataEntryColumn<PettyCashReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryDropdownCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        options={options}
        optionViewToggle={id === "ewtCode"}
        placeholder={`Select ${columnLabels[id]}`}
        searchPlaceholder={id === "ewtCode" ? "Search tax name, code, rate, or description" : `Search ${columnLabels[id]}`}
        onChange={(value) => {
          const vatType = id === "vatType" ? value : row.vatType;
          const ewtCode = id === "ewtCode" ? value : row.ewtCode;
          page.updateEntry(row.id, {
            [id]: value,
            ...calculatePettyCashReplenishmentEntryTaxFields(row.amount, vatType, ewtCode),
          });
        }}
      />
    ),
  });

  const calculatedMoney = (
    id: "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount",
  ): ModuleDataEntryColumn<PettyCashReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={row[id]} />,
  });

  return {
    pettyCashDate: text("pettyCashDate", "date"),
    pettyCashNo: text("pettyCashNo"),
    supplierCode: {
      header: columnLabels.supplierCode,
      id: "supplierCode",
      width: columnWidths.supplierCode,
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.supplierCode} />,
    },
    supplierName: {
      header: columnLabels.supplierName,
      id: "supplierName",
      width: columnWidths.supplierName,
      widthClassName: "w-auto",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.supplierCode || row.supplierName}
          readOnly={page.isReadonly}
          options={supplierOptions}
          placeholder="Select Supplier Name"
          searchPlaceholder="Search Supplier Name"
          addAction={
            !page.isReadonly && onOpenSupplierDrawer
              ? { label: "Add Vendor", onClick: () => onOpenSupplierDrawer(row.id) }
              : undefined
          }
          onChange={(value) => {
            const selectedSupplier = supplierOptions.find(
              (option) => option.value === value || option.name === value || option.label === value,
            );
            page.updateEntry(row.id, {
              supplierCode: String(selectedSupplier?.label ?? selectedSupplier?.value ?? ""),
              supplierName: selectedSupplier?.name ?? String(value),
            });
          }}
        />
      ),
    },
    amount: money("amount", (row, value) =>
      page.updateEntry(row.id, {
        amount: value,
        ...calculatePettyCashReplenishmentEntryTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    netAmount: calculatedMoney("netAmount"),
    vatType: dropdown("vatType", PettyCashReplenishmentEntryVatTypeOptions),
    vatPercent: calculatedMoney("vatPercent"),
    vatAmount: calculatedMoney("vatAmount"),
    ewtCode: dropdown("ewtCode", PettyCashReplenishmentEntryEwtCodeOptions),
    ewtPercent: calculatedMoney("ewtPercent"),
    ewtAmount: calculatedMoney("ewtAmount"),
    disburseAmount: calculatedMoney("disburseAmount"),
    responsibilityCenterCode: {
      header: columnLabels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: columnWidths.responsibilityCenterCode,
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.responsibilityCenterCode} />,
    },
    responsibilityCenterName: {
      header: columnLabels.responsibilityCenterName,
      id: "responsibilityCenterName",
      width: columnWidths.responsibilityCenterName,
      widthClassName: "w-auto",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.responsibilityCenterCode}
          readOnly={page.isReadonly}
          options={PettyCashReplenishmentResponsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          onChange={(value) => {
            const selectedCenter = PettyCashReplenishmentResponsibilityCenterOptions.find(
              (option) => option.value === value,
            );
            page.updateEntry(row.id, {
              responsibilityCenterCode: String(selectedCenter?.value ?? ""),
              responsibilityCenterName: selectedCenter?.name ?? "",
            });
          }}
        />
      ),
    },
    particulars: {
      header: columnLabels.particulars,
      id: "particulars",
      width: columnWidths.particulars,
      widthClassName: "w-auto",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={page.isReadonly}
          dialogTitle="Particulars"
          value={row.particulars ?? row.remarks ?? ""}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => page.updateEntry(row.id, { particulars: value, remarks: value })}
        />
      ),
    },
  };
}

export function createPettyCashReplenishmentAccountingColumns({
  columnLabels,
  columnWidths,
}: PettyCashReplenishmentAccountingEntryColumnsParams): Record<
  PettyCashReplenishmentAccountingColumnId,
  ModuleDataEntryColumn<PettyCashReplenishmentAccountingEntry>
> {
  const column = (id: PettyCashReplenishmentAccountingColumnId): ModuleDataEntryColumn<PettyCashReplenishmentAccountingEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
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
    particulars: column("particulars"),
  };
}
