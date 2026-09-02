import type {
  RevolvingFundReplenishmentAccountingEntryColumnsParams,
  RevolvingFundReplenishmentAccountingColumnId,
  RevolvingFundReplenishmentAccountingEntry,
  RevolvingFundReplenishmentDetailEntryColumnsParams,
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import {
  RevolvingFundReplenishmentEntryEwtCodeOptions,
  RevolvingFundReplenishmentEntryVatTypeOptions,
  RevolvingFundReplenishmentResponsibilityCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { calculateRevolvingFundReplenishmentEntryTaxFields } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";

import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export function createRevolvingFundReplenishmentLineColumns({
  columnLabels,
  columnWidths,
  onOpenSupplierDrawer,
  page,
  supplierOptions = [],
}: RevolvingFundReplenishmentDetailEntryColumnsParams): Record<
  RevolvingFundReplenishmentEntryColumnId,
  ModuleDataEntryColumn<RevolvingFundReplenishmentEntry>
> {
  const text = (
    id: RevolvingFundReplenishmentEntryColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<RevolvingFundReplenishmentEntry> => ({
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
    id: RevolvingFundReplenishmentEntryColumnId,
    onChange?: (row: RevolvingFundReplenishmentEntry, value: string) => void,
  ): ModuleDataEntryColumn<RevolvingFundReplenishmentEntry> => ({
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
  ): ModuleDataEntryColumn<RevolvingFundReplenishmentEntry> => ({
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
            ...calculateRevolvingFundReplenishmentEntryTaxFields(row.amount, vatType, ewtCode),
          });
        }}
      />
    ),
  });

  const calculatedMoney = (
    id: "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount",
  ): ModuleDataEntryColumn<RevolvingFundReplenishmentEntry> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={row[id]} />,
  });

  return {
    revolvingFundDate: text("revolvingFundDate", "date"),
    revolvingFundNo: text("revolvingFundNo"),
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
            const vatType = getDefaultVatType(selectedSupplier, row.vatType, RevolvingFundReplenishmentEntryVatTypeOptions);
            const ewtCode = getDefaultEwtCode(selectedSupplier, row.ewtCode, RevolvingFundReplenishmentEntryEwtCodeOptions);
            page.updateEntry(row.id, {
              supplierCode: String(selectedSupplier?.label ?? selectedSupplier?.value ?? ""),
              supplierName: selectedSupplier?.name ?? String(value),
              vatType,
              ewtCode,
              ...calculateRevolvingFundReplenishmentEntryTaxFields(row.amount, vatType, ewtCode),
            });
          }}
        />
      ),
    },
    amount: money("amount", (row, value) =>
      page.updateEntry(row.id, {
        amount: value,
        ...calculateRevolvingFundReplenishmentEntryTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    netAmount: calculatedMoney("netAmount"),
    vatType: dropdown("vatType", RevolvingFundReplenishmentEntryVatTypeOptions),
    vatPercent: calculatedMoney("vatPercent"),
    vatAmount: calculatedMoney("vatAmount"),
    ewtCode: dropdown("ewtCode", RevolvingFundReplenishmentEntryEwtCodeOptions),
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
          options={RevolvingFundReplenishmentResponsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          onChange={(value) => {
            const selectedCenter = RevolvingFundReplenishmentResponsibilityCenterOptions.find(
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

function getDefaultVatType(
  option: AppAdvancedDropdownOption | undefined,
  fallback: string,
  vatOptions: AppAdvancedDropdownOption[],
) {
  const taxOption = option as (AppAdvancedDropdownOption & {
    defaultPurchaseInputVatTaxSourceKey?: string;
    vatCode?: string;
    vatType?: string;
  }) | undefined;
  const rawValue = taxOption?.vatType || taxOption?.vatCode || taxOption?.defaultPurchaseInputVatTaxSourceKey || "";
  const normalized = rawValue.toLowerCase();
  const matchedOption = vatOptions.find(
    (vatOption) =>
      vatOption.value.toLowerCase() === normalized ||
      vatOption.name.toLowerCase() === normalized ||
      (normalized.includes("12") && vatOption.value.toLowerCase().includes("12")) ||
      (normalized.includes("zero") && vatOption.value.toLowerCase().includes("zero")) ||
      (normalized.includes("exempt") && vatOption.value.toLowerCase().includes("exempt")),
  );

  return matchedOption?.value ?? fallback;
}

function getDefaultEwtCode(
  option: AppAdvancedDropdownOption | undefined,
  fallback: string,
  ewtOptions: AppAdvancedDropdownOption[],
) {
  const taxOption = option as (AppAdvancedDropdownOption & {
    defaultPurchaseEwtTaxSourceKey?: string;
    ewtCode?: string;
  }) | undefined;
  const rawValue = taxOption?.ewtCode || taxOption?.defaultPurchaseEwtTaxSourceKey || "";
  const normalized = rawValue.toLowerCase();
  const matchedOption = ewtOptions.find(
    (ewtOption) =>
      ewtOption.value.toLowerCase() === normalized ||
      ewtOption.name.toLowerCase() === normalized ||
      ewtOption.name.toLowerCase().startsWith(`${normalized} `),
  );

  return matchedOption?.value ?? fallback;
}

export function createRevolvingFundReplenishmentAccountingColumns({
  columnLabels,
  columnWidths,
}: RevolvingFundReplenishmentAccountingEntryColumnsParams): Record<
  RevolvingFundReplenishmentAccountingColumnId,
  ModuleDataEntryColumn<RevolvingFundReplenishmentAccountingEntry>
> {
  const column = (id: RevolvingFundReplenishmentAccountingColumnId): ModuleDataEntryColumn<RevolvingFundReplenishmentAccountingEntry> => ({
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
