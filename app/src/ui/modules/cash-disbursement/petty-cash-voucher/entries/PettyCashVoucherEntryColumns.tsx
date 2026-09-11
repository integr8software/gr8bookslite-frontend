import { calculatePettyCashVoucherItemTaxFields } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type {
  PettyCashVoucherAccountingColumnId,
  PettyCashVoucherAccountingEntry,
  PettyCashVoucherItem,
  PettyCashVoucherItemColumnsParams,
  PettyCashVoucherItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";

export function createPettyCashVoucherItemColumns({
  columnLabels,
  columnWidths,
  disbursementTypeOptions,
  ewtOptions,
  isReadonly,
  onOpenDisbursementTypeDrawer,
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  responsibilityCenterOptions,
  supplierOptions,
  taxCodes,
  updateItem,
  vatOptions,
}: PettyCashVoucherItemColumnsParams): Record<PettyCashVoucherItemColumnId, ModuleDataEntryColumn<PettyCashVoucherItem>> {
  const text = (id: PettyCashVoucherItemColumnId, type: "text" | "date" = "text"): ModuleDataEntryColumn<PettyCashVoucherItem> => ({
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
        readOnly={isReadonly}
        placeholder={`Enter ${columnLabels[id]}`}
        onChange={(value) => updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const money = (
    id: PettyCashVoucherItemColumnId,
    onChange?: (row: PettyCashVoucherItem, value: string) => void,
  ): ModuleDataEntryColumn<PettyCashVoucherItem> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={isReadonly}
        placeholder="0.00"
        onChange={(value) => (onChange ? onChange(row, value) : updateItem(row.id, { [id]: value }))}
      />
    ),
  });

  const dropdown = (
    id: PettyCashVoucherItemColumnId,
    options: AppAdvancedDropdownOption[],
  ): ModuleDataEntryColumn<PettyCashVoucherItem> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryDropdownCell
        id={context.fieldId}
        name={context.fieldName}
        value={String(row[id])}
        readOnly={isReadonly}
        options={options}
        placeholder={`Select ${columnLabels[id]}`}
        searchPlaceholder={`Search ${columnLabels[id]}`}
        onChange={(value) => updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const calculatedMoney = (id: PettyCashVoucherItemColumnId): ModuleDataEntryColumn<PettyCashVoucherItem> => ({
    header: columnLabels[id],
    id,
    width: columnWidths[id],
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={String(row[id] ?? "")} />,
  });

  return {
    disbursementType: {
      ...dropdown("disbursementType", disbursementTypeOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.disbursementType || row.expenseType || row.type}
          readOnly={isReadonly}
          options={disbursementTypeOptions}
          placeholder="Select Disbursement Type"
          searchPlaceholder="Search Disbursement Type"
          addAction={
            !isReadonly && onOpenDisbursementTypeDrawer
              ? { label: "Add Disbursement Type", onClick: () => onOpenDisbursementTypeDrawer(row.id) }
              : undefined
          }
          onChange={(value) =>
            updateItem(row.id, {
              disbursementType: value,
              expenseType: value,
              type: value,
            })
          }
        />
      ),
    },
    particulars: text("particulars"),
    amount: money("amount", (row, value) =>
      updateItem(row.id, {
        amount: value,
        ...calculatePettyCashVoucherItemTaxFields(value, row.vatType, row.ewtCode, taxCodes),
      }),
    ),
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
          readOnly={isReadonly}
          options={supplierOptions}
          placeholder="Select Supplier"
          searchPlaceholder="Search Supplier"
          addAction={!isReadonly && onOpenSupplierDrawer ? { label: "Add Vendor", onClick: () => onOpenSupplierDrawer(row.id) } : undefined}
          onChange={(value) => {
            const selectedSupplier = supplierOptions.find(
              (option) => option.value === value || option.name === value || option.label === value,
            );
            const vatType = getDefaultVatType(selectedSupplier, row.vatType, vatOptions);
            const ewtCode = getDefaultEwtCode(selectedSupplier, row.ewtCode, ewtOptions);
            updateItem(row.id, {
              supplierCode: String(selectedSupplier?.label ?? selectedSupplier?.value ?? ""),
              supplierName: selectedSupplier?.name ?? String(value),
              vatType,
              ewtCode,
              ...calculatePettyCashVoucherItemTaxFields(row.amount, vatType, ewtCode, taxCodes),
            });
          }}
        />
      ),
    },
    vatType: {
      ...dropdown("vatType", vatOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.vatType}
          readOnly={isReadonly}
          options={vatOptions}
          placeholder="Select VAT Type"
          searchPlaceholder="Search VAT Type"
          onChange={(value) =>
            updateItem(row.id, {
              vatType: value,
              ...calculatePettyCashVoucherItemTaxFields(row.amount, value, row.ewtCode, taxCodes),
            })
          }
        />
      ),
    },
    vatPercent: calculatedMoney("vatPercent"),
    netAmount: calculatedMoney("netAmount"),
    vatAmount: calculatedMoney("vatAmount"),
    date: text("date", "date"),
    ewtCode: {
      ...dropdown("ewtCode", ewtOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.ewtCode}
          readOnly={isReadonly}
          options={ewtOptions}
          optionViewToggle
          placeholder="Select ATC"
          searchPlaceholder="Search ATC name, code, rate, or description"
          onChange={(value) =>
            updateItem(row.id, {
              ewtCode: value,
              ...calculatePettyCashVoucherItemTaxFields(row.amount, row.vatType, value, taxCodes),
            })
          }
        />
      ),
    },
    ewtPercent: calculatedMoney("ewtPercent"),
    ewtAmount: calculatedMoney("ewtAmount"),
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
          readOnly={isReadonly}
          options={responsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          addAction={
            !isReadonly && onOpenResponsibilityCenterDrawer
              ? { label: "Add Responsibility Center", onClick: () => onOpenResponsibilityCenterDrawer(row.id) }
              : undefined
          }
          onChange={(value) => {
            const selectedCenter = responsibilityCenterOptions.find((option) => option.value === value);
            updateItem(row.id, {
              responsibilityCenterCode: String(selectedCenter?.value ?? ""),
              responsibilityCenterName: selectedCenter?.name ?? "",
            });
          }}
        />
      ),
    },
    supplierCode: {
      header: columnLabels.supplierCode,
      id: "supplierCode",
      width: columnWidths.supplierCode,
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.supplierCode} />,
    },
    orNo: text("orNo"),
    tinNo: text("tinNo"),
    type: text("type"),
    disburseAmount: calculatedMoney("disburseAmount"),
    grossAmount: money("grossAmount"),
  };
}

function getDefaultVatType(option: AppAdvancedDropdownOption | undefined, fallback: string, vatOptions: AppAdvancedDropdownOption[]) {
  const taxOption = option as
    | (AppAdvancedDropdownOption & {
        defaultPurchaseInputVatTaxSourceKey?: string;
        vatCode?: string;
        vatType?: string;
      })
    | undefined;
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

function getDefaultEwtCode(option: AppAdvancedDropdownOption | undefined, fallback: string, ewtOptions: AppAdvancedDropdownOption[]) {
  const taxOption = option as
    | (AppAdvancedDropdownOption & {
        defaultPurchaseEwtTaxSourceKey?: string;
        ewtCode?: string;
      })
    | undefined;
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

export function createPettyCashVoucherAccountingColumns(
  labels: Record<PettyCashVoucherAccountingColumnId, string>,
  widths: Record<PettyCashVoucherAccountingColumnId, number>,
): Record<PettyCashVoucherAccountingColumnId, ModuleDataEntryColumn<PettyCashVoucherAccountingEntry>> {
  const column = (id: PettyCashVoucherAccountingColumnId): ModuleDataEntryColumn<PettyCashVoucherAccountingEntry> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align={id === "debit" || id === "credit" ? "right" : "left"} value={row[id] ?? ""} />,
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
