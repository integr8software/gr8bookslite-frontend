import { AccountingPartyFallbackValuePrefix } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import { getAccountingPartyFallbackValue } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
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
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  normalizeVatDropdownValue,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherTaxData";
import {
  EntryInput,
  EntryNumberInput,
  ExpenseDetailValue,
  accountingCellControlClassName,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryCellControls";
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
      renderCell: (entry, rowIndex, context) => (
        <EntryInput id={context.fieldId} label={`${columnLabels.accountCode} row ${rowIndex + 1}`} value={entry.accountCode ?? ""} onChange={() => undefined} readOnly />
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
          placeholder="Select Disbursement Type"
          searchPlaceholder="Search Disbursement Type"
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
        <ModuleDataEntryReadonlyCell align="right" value={Number(entry.debit) !== 0 ? formatAmount(entry.debit) : ""} />
      ),
    },
    credit: {
      header: columnLabels.credit,
      id: "credit",
      width: columnWidths.credit,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell align="right" value={Number(entry.credit) !== 0 ? formatAmount(entry.credit) : ""} />
      ),
    },
    checkNo: {
      header: columnLabels.checkNo,
      id: "checkNo",
      width: columnWidths.checkNo,
      widthClassName: "w-[12rem]",
      renderCell: (entry, rowIndex, context) => (
        <EntryInput id={context.fieldId} label={`${columnLabels.checkNo} row ${rowIndex + 1}`} value={entry.checkNo ?? ""} onChange={(value) => onUpdateEntry(entry.id, "checkNo", value)} disabled={isReadonly} />
      ),
    },
    checkStatus: {
      header: columnLabels.checkStatus,
      id: "checkStatus",
      width: columnWidths.checkStatus,
      widthClassName: "w-[11rem]",
      renderCell: (entry, rowIndex, context) => (
        <EntryInput
          id={context.fieldId}
          label={`${columnLabels.checkStatus} row ${rowIndex + 1}`}
          value={entry.checkStatus ?? ""}
          onChange={(value) => onUpdateEntry(entry.id, "checkStatus", value)}
          disabled={isReadonly}
        />
      ),
    },
    checkDate: {
      header: columnLabels.checkDate,
      id: "checkDate",
      width: columnWidths.checkDate,
      widthClassName: "w-[10rem]",
      renderCell: (entry, rowIndex, context) => (
        <>
          <label htmlFor={context.fieldId} className="sr-only">{`${columnLabels.checkDate} row ${rowIndex + 1}`}</label>
          <input
            id={context.fieldId}
            type="date"
            value={entry.checkDate ?? ""}
            disabled={isReadonly}
            onChange={(event) => onUpdateEntry(entry.id, "checkDate", event.target.value)}
            className={accountingCellControlClassName()}
          />
        </>
      ),
    },
    remarks: {
      header: columnLabels.remarks,
      id: "remarks",
      width: columnWidths.remarks,
      widthClassName: "w-[22rem]",
      renderCell: (entry, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={isReadonly}
          value={entry.remarks}
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => onUpdateEntry(entry.id, "remarks", value)}
        />
      ),
    },
    partyCode: {
      header: columnLabels.partyCode,
      id: "partyCode",
      width: columnWidths.partyCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry, rowIndex, context) => (
        <EntryInput id={context.fieldId} label={`${columnLabels.partyCode} row ${rowIndex + 1}`} value={entry.partyCode ?? ""} onChange={() => undefined} readOnly />
      ),
    },
    partyName: {
      header: columnLabels.partyName,
      id: "partyName",
      width: columnWidths.partyName,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          addAction={!isReadonly && canAddPartyName ? { label: "Add Party Name", onClick: onAddPartyName } : undefined}
          value={entry.partyCode || getAccountingPartyFallbackValue(entry.partyName ?? "")}
          readOnly={isReadonly}
          options={partyOptions}
          placeholder="Select Party Name"
          searchPlaceholder="Search Party Name"
          className={CashVoucherAccountingDropdownClassName}
          onChange={(value) => {
            const selectedValue = String(value);
            const party = partyOptions.find((option) => option.value === selectedValue);
            const isFallbackValue = selectedValue.startsWith(AccountingPartyFallbackValuePrefix);

            onUpdateEntryFields(entry.id, {
              partyCode: isFallbackValue ? "" : selectedValue,
              partyName: party?.name ?? "",
            });
          }}
        />
      ),
    },
    responsibilityCenter: {
      header: columnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      width: columnWidths.responsibilityCenter,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell
          title={entry.responsibilityCenter || undefined}
          value={entry.responsibilityCenter ?? ""}
        />
      ),
    },
    responsibilityCenterCode: {
      header: columnLabels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: columnWidths.responsibilityCenterCode,
      widthClassName: "w-[14rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell
          title={entry.responsibilityCenter || undefined}
          value={entry.responsibilityCenter ?? ""}
        />
      ),
    },
    refId: {
      header: columnLabels.refId,
      id: "refId",
      width: columnWidths.refId,
      widthClassName: "w-[12rem]",
      renderCell: (entry, rowIndex, context) => (
        <EntryInput id={context.fieldId} label={`${columnLabels.refId} row ${rowIndex + 1}`} value={entry.refId ?? ""} onChange={(value) => onUpdateEntry(entry.id, "refId", value)} disabled={isReadonly} />
      ),
    },
    vatType: {
      header: columnLabels.vatType,
      id: "vatType",
      width: columnWidths.vatType,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell title={entry.vatType || undefined} value={entry.vatType ?? ""} />
      ),
    },
    atcCode: {
      header: columnLabels.atcCode,
      id: "atcCode",
      width: columnWidths.atcCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <ModuleDataEntryReadonlyCell title={entry.atcCode || undefined} value={entry.atcCode ?? ""} />
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
  onAddExpenseType,
  onAddResponsibilityCenter,
  responsibilityCenterOptions,
  taxCodes,
  updateExpenseEntryFields,
  vatOptions,
}: CashVoucherExpenseEntryColumnsParams): Record<ExpenseEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>> {
  return {
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
      widthClassName: "w-[15rem]",
      renderCell: (entry) => (
        <ChartAccountDropdown
          addAction={!isReadonly && canAddExpenseType ? { label: "Add Disbursement Type", onClick: onAddExpenseType } : undefined}
          accounts={expenseAccounts}
          value={entry.accountName}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
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
      ),
    },
    amount: {
      header: expenseColumnLabels.amount,
      id: "amount",
      width: expenseColumnWidths.amount,
      widthClassName: "w-[10rem]",
      renderCell: (entry, rowIndex, context) => (
        <EntryNumberInput
          id={context.fieldId}
          label={`${expenseColumnLabels.amount} row ${rowIndex + 1}`}
          allowNegative
          value={entry.taxDetails.grossAmount}
          onChange={(value) =>
            updateExpenseEntryFields(entry.id, {
              credit: 0,
              debit: value,
              taxDetails: syncTaxDetailsAmount(entry.taxDetails, value, entry.taxRate),
            })
          }
          disabled={isReadonly}
        />
      ),
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
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.netAmount} />,
    },
    vatCode: {
      header: expenseColumnLabels.vatCode,
      id: "vatCode",
      width: expenseColumnWidths.vatCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={normalizeVatDropdownValue(entry.taxDetails, taxCodes)}
          readOnly={isReadonly}
          isClearable
          options={vatOptions}
          placeholder="Select VAT"
          searchPlaceholder="Search VAT Rate or Description"
          className={CashVoucherAccountingDropdownClassName}
          onChange={(value) => {
            const vatCode = String(value);
            const taxRate = getVatRateFromCode(vatCode, taxCodes);

            updateExpenseEntryFields(entry.id, {
              taxRate,
              taxDetails: syncTaxDetailsAmount(
                {
                  ...entry.taxDetails,
                  vatCode,
                  vatPercent: getVatPercentFromRate(taxRate),
                },
                entry.taxDetails.grossAmount,
                taxRate,
              ),
            });
          }}
        />
      ),
    },
    vatPercent: {
      header: expenseColumnLabels.vatPercent,
      id: "vatPercent",
      width: expenseColumnWidths.vatPercent,
      widthClassName: "w-[7rem]",
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.vatPercent} suffix="%" />,
    },
    vatAmount: {
      header: expenseColumnLabels.vatAmount,
      id: "vatAmount",
      width: expenseColumnWidths.vatAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.vatAmount} />,
    },
    ewtCode: {
      header: expenseColumnLabels.ewtCode,
      id: "ewtCode",
      width: expenseColumnWidths.ewtCode,
      widthClassName: "w-[13rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={entry.taxDetails.ewtCode}
          readOnly={isReadonly}
          isClearable
          options={ewtOptions}
          placeholder="Select EWT"
          searchPlaceholder="Search EWT Code, Rate, or Description"
          className={CashVoucherAccountingDropdownClassName}
          onChange={(value) => {
            const ewtCode = String(value);

            updateExpenseEntryFields(entry.id, {
              taxDetails: syncTaxDetailsAmount(
                {
                  ...entry.taxDetails,
                  ewtCode,
                  ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
                },
                entry.taxDetails.grossAmount,
                entry.taxRate,
              ),
            });
          }}
        />
      ),
    },
    ewtPercent: {
      header: expenseColumnLabels.ewtPercent,
      id: "ewtPercent",
      width: expenseColumnWidths.ewtPercent,
      widthClassName: "w-[7rem]",
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.ewtPercent} suffix="%" />,
    },
    ewtAmount: {
      header: expenseColumnLabels.ewtAmount,
      id: "ewtAmount",
      width: expenseColumnWidths.ewtAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.ewtAmount} />,
    },
    totalAmountDue: {
      header: expenseColumnLabels.totalAmountDue,
      id: "totalAmountDue",
      width: expenseColumnWidths.totalAmountDue,
      widthClassName: "w-[10rem]",
      renderCell: (entry) => <ExpenseDetailValue value={entry.taxDetails.amount} />,
    },
    partyName: {
      ...accountingColumns.partyName,
      header: expenseColumnLabels.partyName,
      id: "partyName",
      width: expenseColumnWidths.partyName,
    },
    partyCode: {
      ...accountingColumns.partyCode,
      header: expenseColumnLabels.partyCode,
      id: "partyCode",
      width: expenseColumnWidths.partyCode,
    },
    remarks: {
      ...accountingColumns.remarks,
      header: expenseColumnLabels.remarks,
      id: "remarks",
      width: expenseColumnWidths.remarks,
    },
    responsibilityCenter: {
      header: expenseColumnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      width: expenseColumnWidths.responsibilityCenter,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          addAction={
            !isReadonly && canAddResponsibilityCenter
              ? {
                  label: "Add Responsibility Center",
                  onClick: () => onAddResponsibilityCenter(entry.id),
                }
              : undefined
          }
          value={entry.responsibilityCenter ?? ""}
          readOnly={isReadonly}
          options={responsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          className={CashVoucherAccountingDropdownClassName}
          onChange={(value) => {
            const responsibilityCenter = String(value);

            updateExpenseEntryFields(entry.id, {
              responsibilityCenter,
              taxDetails: {
                ...entry.taxDetails,
                responsibilityCenter,
              },
            });
          }}
        />
      ),
    },
    responsibilityCenterCode: {
      ...accountingColumns.responsibilityCenterCode,
      header: expenseColumnLabels.responsibilityCenterCode,
      id: "responsibilityCenterCode",
      width: expenseColumnWidths.responsibilityCenterCode,
    },
    refId: {
      ...accountingColumns.refId,
      header: expenseColumnLabels.refId,
      id: "refId",
      width: expenseColumnWidths.refId,
    },
  };
}


