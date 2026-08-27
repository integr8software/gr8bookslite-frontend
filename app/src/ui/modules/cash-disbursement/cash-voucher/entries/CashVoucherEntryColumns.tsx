import { AccountingPartyFallbackValuePrefix } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  isGeneratedEwtEntry,
  isGeneratedVatEntry,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherAccountingEntryColumnsParams,
  CashVoucherEntryColumnId,
  CashVoucherExpenseEntryColumnsParams,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  normalizeVatDropdownValue,
} from "@/app/src/data/shared/tax/TaxData";
import { CashVoucherAccountingDropdownClassName } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import { formatAmount } from "@/app/src/utils/currency.util";

export function createCashVoucherAccountingEntryColumns({
  canAddPartyName,
  chartAccounts,
  columnLabels,
  columnWidths,
  isReadonly,
  onAddPartyName,
  onUpdateEntry,
  onUpdateEntryFields,
  partyOptions,
}: CashVoucherAccountingEntryColumnsParams): Record<CashVoucherEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>> {
  return {
    accountCode: {
      header: columnLabels.accountCode,
      id: "accountCode",
      width: columnWidths.accountCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell id={context.fieldId} name={context.fieldName} value={entry.accountCode ?? ""} readOnly />
      ),
    },
    accountName: {
      header: columnLabels.accountName,
      id: "accountName",
      width: columnWidths.accountName,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => (
        <ChartAccountDropdown
          accounts={chartAccounts}
          value={entry.accountName}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
          className={CashVoucherAccountingDropdownClassName}
          placeholder="Select Account Title"
          searchPlaceholder="Search Account Title"
          onChange={() => undefined}
          onSelectAccount={(account) =>
            onUpdateEntryFields(entry.id, {
              accountCode: account?.accountNumber ?? "",
              accountName: account?.accountName ?? "",
            })
          }
        />
      ),
    },
    debit: {
      header: columnLabels.debit,
      id: "debit",
      width: columnWidths.debit,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell
          align="right"
          value={Number(entry.debit) !== 0 ? formatAmount(entry.debit) : "0.00"}
        />
      ),
    },
    credit: {
      header: columnLabels.credit,
      id: "credit",
      width: columnWidths.credit,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell
          align="right"
          value={Number(entry.credit) !== 0 ? formatAmount(entry.credit) : "0.00"}
        />
      ),
    },
    checkNo: {
      header: columnLabels.checkNo,
      id: "checkNo",
      width: columnWidths.checkNo,
      widthClassName: "w-[12rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          value={entry.checkNo ?? ""}
          placeholder={`Enter ${columnLabels.checkNo}`}
          onChange={(value) => onUpdateEntry(entry.id, "checkNo", value)}
          readOnly={isReadonly}
        />
      ),
    },
    checkStatus: {
      header: columnLabels.checkStatus,
      id: "checkStatus",
      width: columnWidths.checkStatus,
      widthClassName: "w-[11rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          value={entry.checkStatus ?? ""}
          placeholder={`Enter ${columnLabels.checkStatus}`}
          onChange={(value) => onUpdateEntry(entry.id, "checkStatus", value)}
          readOnly={isReadonly}
        />
      ),
    },
    checkDate: {
      header: columnLabels.checkDate,
      id: "checkDate",
      width: columnWidths.checkDate,
      widthClassName: "w-[10rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          type="date"
          value={entry.checkDate ?? ""}
          placeholder={`Select ${columnLabels.checkDate}`}
          readOnly={isReadonly}
          onChange={(value) => onUpdateEntry(entry.id, "checkDate", value)}
        />
      ),
    },
    remarks: {
      header: columnLabels.remarks,
      id: "remarks",
      width: columnWidths.remarks,
      widthClassName: "w-[16rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          value={entry.remarks}
          isReadonly={isReadonly}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => onUpdateEntry(entry.id, "remarks", value)}
        />
      ),
    },
    partyCode: {
      header: columnLabels.partyCode,
      id: "partyCode",
      width: columnWidths.partyCode,
      widthClassName: "w-[10rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell id={context.fieldId} name={context.fieldName} value={entry.partyCode ?? ""} readOnly />
      ),
    },
    partyName: {
      header: columnLabels.partyName,
      id: "partyName",
      width: columnWidths.partyName,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => {
        const partyName = (entry.partyName ?? "").trim();
        const selectedOption = partyOptions.find(
          (option) =>
            option.name.toLowerCase() === partyName.toLowerCase() ||
            (entry.partyCode && option.value === entry.partyCode),
        );
        const dropdownValue = selectedOption
          ? selectedOption.value
          : partyName
            ? `${AccountingPartyFallbackValuePrefix}${partyName}`
            : "";

        return (
          <AppAdvancedDropdown
            addAction={
              canAddPartyName && !isReadonly
                ? {
                    label: "Add Party Name",
                    onClick: onAddPartyName,
                  }
                : undefined
            }
            className={CashVoucherAccountingDropdownClassName}
            isClearable
            options={partyOptions}
            placeholder="Select Party Name"
            searchPlaceholder="Search Party Name"
            readOnly={isReadonly}
            value={dropdownValue}
            onChange={(value) => {
              const selectedParty = partyOptions.find((option) => option.value === value);

              onUpdateEntryFields(entry.id, {
                partyCode: selectedParty?.value.startsWith(AccountingPartyFallbackValuePrefix)
                  ? ""
                  : (selectedParty?.label ?? ""),
                partyName: selectedParty?.name ?? "",
              });
            }}
          />
        );
      },
    },
    refId: {
      header: columnLabels.refId,
      id: "refId",
      width: columnWidths.refId,
      widthClassName: "w-[10rem]",
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          value={entry.refId ?? ""}
          placeholder={`Enter ${columnLabels.refId}`}
          onChange={(value) => onUpdateEntry(entry.id, "refId", value)}
          readOnly={isReadonly}
        />
      ),
    },
    responsibilityCenterCode: {
      header: columnLabels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: columnWidths.responsibilityCenterCode,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell value={entry.responsibilityCenter ?? ""} />,
    },
    responsibilityCenter: {
      header: columnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      width: columnWidths.responsibilityCenter,
      widthClassName: "w-[15rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell value={entry.responsibilityCenter ?? ""} />,
    },
    vatType: {
      header: columnLabels.vatType,
      id: "vatType",
      width: columnWidths.vatType,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell value={isGeneratedVatEntry(entry) ? (entry.vatType ?? entry.taxDetails?.vatType ?? "") : ""} />
      ),
    },
    ewtCode: {
      header: columnLabels.ewtCode,
      id: "ewtCode",
      width: columnWidths.ewtCode,
      widthClassName: "w-[10rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell value={isGeneratedEwtEntry(entry) ? (entry.ewtCode ?? entry.taxDetails?.ewtCode ?? "") : ""} />
      ),
    },
  };
}

export function createCashVoucherExpenseEntryColumns({
  accountingColumns,
  canAddExpenseType,
  canAddResponsibilityCenter,
  ewtOptions,
  expenseAccounts,
  expenseColumnLabels,
  expenseColumnWidths,
  isReadonly,
  lineErrors = {},
  onAddExpenseType,
  onAddResponsibilityCenter,
  responsibilityCenterOptions,
  taxCodes,
  updateExpenseEntryFields,
  vatOptions,
}: CashVoucherExpenseEntryColumnsParams): Record<ExpenseEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>> {
  return {
    partyCode: {
      ...accountingColumns.partyCode,
      header: expenseColumnLabels.partyCode,
      id: "partyCode",
      width: expenseColumnWidths.partyCode,
    },
    partyName: {
      ...accountingColumns.partyName,
      header: expenseColumnLabels.partyName,
      id: "partyName",
      width: expenseColumnWidths.partyName,
    },
    disbursementCode: {
      ...accountingColumns.accountCode,
      header: expenseColumnLabels.disbursementCode,
      id: "disbursementCode",
      width: expenseColumnWidths.disbursementCode,
    },
    expenseType: {
      header: expenseColumnLabels.expenseType,
      id: "expenseType",
      width: expenseColumnWidths.expenseType,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => {
        const isInvalid = Boolean(
          lineErrors[entry.id]?.expenseType ||
          lineErrors[entry.id]?.accountName ||
          lineErrors[entry.id]?.accountCode,
        );

        return (
          <ChartAccountDropdown
            accounts={expenseAccounts}
            ariaInvalid={isInvalid}
            value={entry.accountName}
            valueField="accountName"
            readOnly={isReadonly}
            isClearable
            addAction={
              canAddExpenseType && !isReadonly
                ? {
                    label: "Add Disbursement Type",
                    onClick: onAddExpenseType,
                  }
                : undefined
            }
            className={CashVoucherAccountingDropdownClassName}
            placeholder="Select Disbursement Type"
            searchPlaceholder="Search Disbursement Type"
            onChange={() => undefined}
            onSelectAccount={(account) =>
              updateExpenseEntryFields(entry.id, {
                accountCode: account?.accountNumber ?? "",
                accountName: account?.accountName ?? "",
              })
            }
          />
        );
      },
    },
    amount: {
      header: expenseColumnLabels.amount,
      id: "amount",
      width: expenseColumnWidths.amount,
      widthClassName: "w-[10rem]",
      renderCell: (entry, _rowIndex, context) => {
        const isInvalid = Boolean(
          lineErrors[entry.id]?.amount ||
          lineErrors[entry.id]?.debit ||
          lineErrors[entry.id]?.credit,
        );

        return (
          <ModuleDataEntryMoneyCell
            id={context.fieldId}
            name={context.fieldName}
            value={entry.taxDetails.grossAmount}
            placeholder="0.00"
            isInvalid={isInvalid}
            readOnly={isReadonly}
            onChange={(value) => {
              const numValue = parseMoneyNumberInput(value);
              updateExpenseEntryFields(entry.id, {
                credit: 0,
                debit: numValue,
                taxDetails: syncTaxDetailsAmount(entry.taxDetails, numValue, entry.taxRate),
              });
            }}
          />
        );
      },
    },
    checkNo: {
      ...accountingColumns.checkNo,
      header: expenseColumnLabels.checkNo,
      id: "checkNo",
      width: expenseColumnWidths.checkNo,
    },
    checkStatus: {
      ...accountingColumns.checkStatus,
      header: expenseColumnLabels.checkStatus,
      id: "checkStatus",
      width: expenseColumnWidths.checkStatus,
    },
    checkDate: {
      ...accountingColumns.checkDate,
      header: expenseColumnLabels.checkDate,
      id: "checkDate",
      width: expenseColumnWidths.checkDate,
    },
    netAmount: {
      header: expenseColumnLabels.netAmount,
      id: "netAmount",
      width: expenseColumnWidths.netAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell align="right" value={formatAmount(entry.taxDetails.netAmount)} />,
    },
    vatCode: {
      header: expenseColumnLabels.vatCode,
      id: "vatCode",
      width: expenseColumnWidths.vatCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => {
        const isInvalid = Boolean(lineErrors[entry.id]?.vatCode || lineErrors[entry.id]?.vatType);

        return (
          <AppAdvancedDropdown
            ariaInvalid={isInvalid}
            value={normalizeVatDropdownValue(entry.taxDetails, taxCodes)}
            readOnly={isReadonly}
            isClearable
            options={vatOptions}
            placeholder="Select VAT Code"
            searchPlaceholder="Search VAT Code"
            className={CashVoucherAccountingDropdownClassName}
            onChange={(value) => {
              const nextVatCode = String(value ?? "");
              const nextTaxRate = getVatRateFromCode(nextVatCode, taxCodes);
              const nextVatPercent = getVatPercentFromRate(nextTaxRate);
              const nextTaxDetails = syncTaxDetailsAmount(
                {
                  ...entry.taxDetails,
                  vatCode: nextVatCode,
                  vatPercent: nextVatPercent,
                },
                entry.taxDetails.grossAmount,
                nextTaxRate,
              );

              updateExpenseEntryFields(entry.id, {
                taxDetails: nextTaxDetails,
                taxRate: nextTaxRate,
                vatType: nextVatCode,
              });
            }}
          />
        );
      },
    },
    vatPercent: {
      header: expenseColumnLabels.vatPercent,
      id: "vatPercent",
      width: expenseColumnWidths.vatPercent,
      widthClassName: "w-[8rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell align="right" value={`${formatAmount(entry.taxDetails.vatPercent)}%`} />
      ),
    },
    vatAmount: {
      header: expenseColumnLabels.vatAmount,
      id: "vatAmount",
      width: expenseColumnWidths.vatAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell align="right" value={formatAmount(entry.taxDetails.vatAmount)} />,
    },
    ewtCode: {
      header: expenseColumnLabels.ewtCode,
      id: "ewtCode",
      width: expenseColumnWidths.ewtCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => {
        const isInvalid = Boolean(lineErrors[entry.id]?.ewtCode || lineErrors[entry.id]?.atcCode);

        return (
          <AppAdvancedDropdown
            ariaInvalid={isInvalid}
            value={entry.taxDetails.ewtCode}
            readOnly={isReadonly}
            isClearable
            options={ewtOptions}
            placeholder="Select EWT Code"
            searchPlaceholder="Search EWT Code"
            className={CashVoucherAccountingDropdownClassName}
            onChange={(value) => {
              const nextEwtCode = String(value ?? "");
              const nextEwtPercent = getEwtPercentFromCode(nextEwtCode, taxCodes);
              const nextTaxDetails = syncTaxDetailsAmount(
                {
                  ...entry.taxDetails,
                  ewtCode: nextEwtCode,
                  ewtPercent: nextEwtPercent,
                },
                entry.taxDetails.grossAmount,
                entry.taxRate,
              );

              updateExpenseEntryFields(entry.id, {
                ewtCode: nextEwtCode,
                taxDetails: nextTaxDetails,
              });
            }}
          />
        );
      },
    },
    ewtPercent: {
      header: expenseColumnLabels.ewtPercent,
      id: "ewtPercent",
      width: expenseColumnWidths.ewtPercent,
      widthClassName: "w-[8rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell align="right" value={`${formatAmount(entry.taxDetails.ewtPercent)}%`} />
      ),
    },
    ewtAmount: {
      header: expenseColumnLabels.ewtAmount,
      id: "ewtAmount",
      width: expenseColumnWidths.ewtAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell align="right" value={formatAmount(entry.taxDetails.ewtAmount)} />,
    },
    remarks: {
      ...accountingColumns.remarks,
      header: expenseColumnLabels.remarks,
      id: "remarks",
      width: expenseColumnWidths.remarks,
    },
    responsibilityCenterCode: {
      ...accountingColumns.responsibilityCenterCode,
      header: expenseColumnLabels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: expenseColumnWidths.responsibilityCenterCode,
    },
    responsibilityCenter: {
      header: expenseColumnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      width: expenseColumnWidths.responsibilityCenter,
      widthClassName: "w-[15rem]",
      renderCell: (entry) => {
        const isInvalid = Boolean(lineErrors[entry.id]?.responsibilityCenter);

        return (
          <AppAdvancedDropdown
            addAction={
              canAddResponsibilityCenter && !isReadonly
                ? {
                    label: "Add Responsibility Center",
                    onClick: () => onAddResponsibilityCenter(entry.id),
                  }
                : undefined
            }
            ariaInvalid={isInvalid}
            className={CashVoucherAccountingDropdownClassName}
            isClearable
            options={responsibilityCenterOptions}
            placeholder="Select Responsibility Center"
            searchPlaceholder="Search Responsibility Center"
            readOnly={isReadonly}
            value={entry.responsibilityCenter ?? ""}
            onChange={(value) =>
              updateExpenseEntryFields(entry.id, {
                responsibilityCenter: String(value ?? ""),
              })
            }
          />
        );
      },
    },
    refId: {
      ...accountingColumns.refId,
      header: expenseColumnLabels.refId,
      id: "refId",
      width: expenseColumnWidths.refId,
    },
  };
}
