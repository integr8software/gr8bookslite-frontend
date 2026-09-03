import { calculatePettyCashFundItemTaxFields } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type {
  PettyCashFundActionPageState,
  PettyCashFundAccountingColumnId,
  PettyCashFundAccountingEntry,
  PettyCashFundItem,
  PettyCashFundItemColumnId,
  PettyCashFundOpenResponsibilityCenterDrawerHandler,
  PettyCashFundOpenSupplierDrawerHandler,
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
  supplierOptions: AppAdvancedDropdownOption[],
  vatOptions: AppAdvancedDropdownOption[] = [],
  ewtOptions: AppAdvancedDropdownOption[] = [],
  responsibilityCenterOptions: AppAdvancedDropdownOption[] = [],
  onOpenResponsibilityCenterDrawer?: PettyCashFundOpenResponsibilityCenterDrawerHandler,
  onOpenSupplierDrawer?: PettyCashFundOpenSupplierDrawerHandler,
): Record<PettyCashFundItemColumnId, ModuleDataEntryColumn<PettyCashFundItem>> {
  const text = (id: PettyCashFundItemColumnId, type: "text" | "date" = "text"): ModuleDataEntryColumn<PettyCashFundItem> => ({
    header: labels[id],
    id,
    width: widths[id],
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
    widthClassName: "w-auto",
    renderCell: (row) => <ModuleDataEntryReadonlyCell align="right" value={String(row[id] ?? "")} />,
  });

  return {
    date: text("date", "date"),
    supplierCode: {
      header: labels.supplierCode,
      id: "supplierCode",
      width: widths.supplierCode,
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.supplierCode} />,
    },
    supplierName: {
      header: labels.supplierName,
      id: "supplierName",
      width: widths.supplierName,
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
            const vatType = getDefaultVatType(selectedSupplier, row.vatType, vatOptions);
            const ewtCode = getDefaultEwtCode(selectedSupplier, row.ewtCode, ewtOptions);
            page.updateItem(row.id, {
              supplierCode: String(selectedSupplier?.label ?? selectedSupplier?.value ?? ""),
              supplierName: selectedSupplier?.name ?? String(value),
              vatType,
              ewtCode,
              ...calculatePettyCashFundItemTaxFields(row.amount, vatType, ewtCode),
            });
          }}
        />
      ),
    },
    orNo: text("orNo"),
    tinNo: text("tinNo"),
    particulars: text("particulars"),
    amount: money("amount", (row, value) =>
      page.updateItem(row.id, {
        amount: value,
        ...calculatePettyCashFundItemTaxFields(value, row.vatType, row.ewtCode),
      }),
    ),
    type: text("type"),
    vatType: {
      ...dropdown("vatType", vatOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.vatType}
          readOnly={page.isReadonly}
          options={vatOptions}
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
      ...dropdown("ewtCode", ewtOptions),
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.ewtCode}
          readOnly={page.isReadonly}
          options={ewtOptions}
          optionViewToggle
          placeholder="Select EWT Code"
          searchPlaceholder="Search tax name, code, rate, or description"
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
    disburseAmount: calculatedMoney("disburseAmount"),
    grossAmount: money("grossAmount"),
    responsibilityCenterCode: {
      header: labels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: widths.responsibilityCenterCode,
      widthClassName: "w-auto",
      renderCell: (row) => <ModuleDataEntryReadonlyCell value={row.responsibilityCenterCode} />,
    },
    responsibilityCenterName: {
      header: labels.responsibilityCenterName,
      id: "responsibilityCenterName",
      width: widths.responsibilityCenterName,
      widthClassName: "w-auto",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          value={row.responsibilityCenterCode}
          readOnly={page.isReadonly}
          options={responsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          addAction={
            !page.isReadonly && onOpenResponsibilityCenterDrawer
              ? { label: "Add Responsibility Center", onClick: () => onOpenResponsibilityCenterDrawer(row.id) }
              : undefined
          }
          onChange={(value) => {
            const selectedCenter = responsibilityCenterOptions.find((option) => option.value === value);
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

export function createPettyCashFundAccountingColumns(
  labels: Record<PettyCashFundAccountingColumnId, string>,
  widths: Record<PettyCashFundAccountingColumnId, number>,
): Record<PettyCashFundAccountingColumnId, ModuleDataEntryColumn<PettyCashFundAccountingEntry>> {
  const column = (id: PettyCashFundAccountingColumnId): ModuleDataEntryColumn<PettyCashFundAccountingEntry> => ({
    header: labels[id],
    id,
    width: widths[id],
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
