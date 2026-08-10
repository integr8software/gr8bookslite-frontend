import { AccountingPartyFallbackValuePrefix } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  getAccountingPartyFallbackValue,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import { syncTaxDetailsAmount } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementAccountingEntryColumnsParams,
  DisbursementEntryColumnId,
  DisbursementExpenseEntryColumnsParams,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  normalizeVatDropdownValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  AccountingDropdownClassName,
  EntryInput,
  EntryNumberInput,
  ExpenseDetailValue,
  ParticularsCell,
  accountingCellControlClassName,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherDataEntrySupport";

export function createDisbursementAccountingEntryColumns({
  canAddPartyName,
  canAddResponsibilityCenter,
  chartAccounts,
  columnLabels,
  columnWidths,
  ewtOptions,
  isReadonly,
  onAddPartyName,
  onAddResponsibilityCenter,
  onOpenParticulars,
  onUpdateEntry,
  onUpdateEntryFields,
  partyOptions,
  responsibilityCenterOptions,
  vatOptions,
}: DisbursementAccountingEntryColumnsParams): Record<
  DisbursementEntryColumnId,
  ModuleDataEntryColumn<DisbursementLineEntry>
> {
  return {
    accountCode: {
      header: columnLabels.accountCode,
      id: "accountCode",
      width: columnWidths.accountCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <EntryInput
          value={entry.accountCode ?? ""}
          onChange={() => undefined}
          readOnly
        />
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
          className={AccountingDropdownClassName}
          placeholder="Select account title"
          searchPlaceholder="Search account title"
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
        <EntryNumberInput
          value={entry.debit}
          onChange={(value) => onUpdateEntry(entry.id, "debit", value)}
          disabled={isReadonly || parseMoneyNumberInput(entry.credit) > 0}
        />
      ),
    },
    credit: {
      header: columnLabels.credit,
      id: "credit",
      width: columnWidths.credit,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => (
        <EntryNumberInput
          value={entry.credit}
          onChange={(value) => onUpdateEntry(entry.id, "credit", value)}
          disabled={isReadonly || parseMoneyNumberInput(entry.debit) > 0}
        />
      ),
    },
    checkNo: {
      header: columnLabels.checkNo,
      id: "checkNo",
      width: columnWidths.checkNo,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <EntryInput
          value={entry.checkNo ?? ""}
          onChange={(value) => onUpdateEntry(entry.id, "checkNo", value)}
          disabled={isReadonly}
        />
      ),
    },
    checkStatus: {
      header: columnLabels.checkStatus,
      id: "checkStatus",
      width: columnWidths.checkStatus,
      widthClassName: "w-[11rem]",
      renderCell: (entry) => (
        <EntryInput
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
      renderCell: (entry) => (
        <input
          type="date"
          value={entry.checkDate ?? ""}
          disabled={isReadonly}
          onChange={(event) =>
            onUpdateEntry(entry.id, "checkDate", event.target.value)
          }
          className={accountingCellControlClassName()}
        />
      ),
    },
    particulars: {
      header: columnLabels.particulars,
      id: "particulars",
      width: columnWidths.particulars,
      widthClassName: "w-[22rem]",
      renderCell: (entry) => (
        <ParticularsCell
          entry={entry}
          isReadonly={isReadonly}
          onOpen={() => onOpenParticulars(entry.id)}
          onUpdate={(value) => onUpdateEntry(entry.id, "particulars", value)}
        />
      ),
    },
    partyCode: {
      header: columnLabels.partyCode,
      id: "partyCode",
      width: columnWidths.partyCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <EntryInput
          value={entry.partyCode ?? ""}
          onChange={() => undefined}
          readOnly
        />
      ),
    },
    partyName: {
      header: columnLabels.partyName,
      id: "partyName",
      width: columnWidths.partyName,
      widthClassName: "w-[18rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          addAction={
            !isReadonly && canAddPartyName
              ? { label: "Add Party Name", onClick: onAddPartyName }
              : undefined
          }
          value={
            entry.partyCode ||
            getAccountingPartyFallbackValue(entry.partyName ?? "")
          }
          readOnly={isReadonly}
          options={partyOptions}
          placeholder="Select Party Name"
          searchPlaceholder="Search Party Name"
          className={AccountingDropdownClassName}
          onChange={(value) => {
            const selectedValue = String(value);
            const party = partyOptions.find(
              (option) => option.value === selectedValue,
            );
            const isFallbackValue = selectedValue.startsWith(
              AccountingPartyFallbackValuePrefix,
            );

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
        <AppAdvancedDropdown
          addAction={
            !isReadonly && canAddResponsibilityCenter
              ? {
                  label: "Add Responsibility Center",
                  onClick: onAddResponsibilityCenter,
                }
              : undefined
          }
          value={entry.responsibilityCenter ?? ""}
          readOnly={isReadonly}
          options={responsibilityCenterOptions}
          placeholder="Select responsibility center"
          searchPlaceholder="Search responsibility center"
          className={AccountingDropdownClassName}
          onChange={(value) =>
            onUpdateEntry(entry.id, "responsibilityCenter", String(value))
          }
        />
      ),
    },
    refId: {
      header: columnLabels.refId,
      id: "refId",
      width: columnWidths.refId,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <EntryInput
          value={entry.refId ?? ""}
          onChange={(value) => onUpdateEntry(entry.id, "refId", value)}
          disabled={isReadonly}
        />
      ),
    },
    vatType: {
      header: columnLabels.vatType,
      id: "vatType",
      width: columnWidths.vatType,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => {
        const vatType = entry.vatType ?? "";

        if (vatType && !vatOptions.some((option) => option.value === vatType)) {
          return (
            <EntryInput
              value={vatType}
              onChange={(value) => onUpdateEntry(entry.id, "vatType", value)}
              disabled={isReadonly}
            />
          );
        }

        return (
          <AppAdvancedDropdown
            value={vatType}
            readOnly={isReadonly}
            isClearable
            options={vatOptions}
            placeholder="Select VAT"
            searchPlaceholder="Search VAT rate or description"
            className={AccountingDropdownClassName}
            onChange={(value) =>
              onUpdateEntry(entry.id, "vatType", String(value))
            }
          />
        );
      },
    },
    atcCode: {
      header: columnLabels.atcCode,
      id: "atcCode",
      width: columnWidths.atcCode,
      widthClassName: "w-[12rem]",
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={entry.atcCode ?? ""}
          readOnly={isReadonly}
          isClearable
          options={ewtOptions}
          placeholder="Select EWT"
          searchPlaceholder="Search EWT code, rate, or description"
          className={AccountingDropdownClassName}
          onChange={(value) =>
            onUpdateEntry(entry.id, "atcCode", String(value))
          }
        />
      ),
    },
  };
}

export function createDisbursementExpenseEntryColumns({
  accountingColumns,
  canAddExpenseType,
  ewtOptions,
  expenseAccounts,
  expenseColumnLabels,
  expenseColumnWidths,
  isReadonly,
  onAddExpenseType,
  taxCodes,
  updateExpenseEntryFields,
  vatOptions,
}: DisbursementExpenseEntryColumnsParams): Record<
  ExpenseEntryColumnId,
  ModuleDataEntryColumn<DisbursementLineEntry>
> {
  return {
    expenseType: {
      header: expenseColumnLabels.expenseType,
      id: "expenseType",
      width: expenseColumnWidths.expenseType,
      widthClassName: "w-[15rem]",
      renderCell: (entry) => (
        <ChartAccountDropdown
          addAction={
            !isReadonly && canAddExpenseType
              ? { label: "Add Expense Type", onClick: onAddExpenseType }
              : undefined
          }
          accounts={expenseAccounts}
          value={entry.accountName}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
          className={AccountingDropdownClassName}
          placeholder="Enter expense type"
          searchPlaceholder="Search expense type"
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
      renderCell: (entry) => (
        <EntryNumberInput
          allowNegative
          value={entry.taxDetails.grossAmount}
          onChange={(value) =>
            updateExpenseEntryFields(entry.id, {
              credit: 0,
              debit: value,
              taxDetails: syncTaxDetailsAmount(
                entry.taxDetails,
                value,
                entry.taxRate,
              ),
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
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.netAmount} />
      ),
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
          searchPlaceholder="Search VAT rate or description"
          className={AccountingDropdownClassName}
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
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.vatPercent} suffix="%" />
      ),
    },
    vatAmount: {
      header: expenseColumnLabels.vatAmount,
      id: "vatAmount",
      width: expenseColumnWidths.vatAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.vatAmount} />
      ),
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
          searchPlaceholder="Search EWT code, rate, or description"
          className={AccountingDropdownClassName}
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
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.ewtPercent} suffix="%" />
      ),
    },
    ewtAmount: {
      header: expenseColumnLabels.ewtAmount,
      id: "ewtAmount",
      width: expenseColumnWidths.ewtAmount,
      widthClassName: "w-[9rem]",
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.ewtAmount} />
      ),
    },
    totalAmountDue: {
      header: expenseColumnLabels.totalAmountDue,
      id: "totalAmountDue",
      width: expenseColumnWidths.totalAmountDue,
      widthClassName: "w-[10rem]",
      renderCell: (entry) => (
        <ExpenseDetailValue value={entry.taxDetails.amount} />
      ),
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
    particulars: {
      ...accountingColumns.particulars,
      header: expenseColumnLabels.particulars,
      id: "particulars",
      width: expenseColumnWidths.particulars,
    },
    responsibilityCenter: {
      ...accountingColumns.responsibilityCenter,
      header: expenseColumnLabels.responsibilityCenter,
      id: "responsibilityCenter",
      width: expenseColumnWidths.responsibilityCenter,
    },
    refId: {
      ...accountingColumns.refId,
      header: expenseColumnLabels.refId,
      id: "refId",
      width: expenseColumnWidths.refId,
    },
  };
}
