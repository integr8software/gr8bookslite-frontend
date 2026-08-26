import { AccountingPartyFallbackValuePrefix } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
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
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryReadonlyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryReadonlyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
  normalizeVatDropdownValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { DisbursementVoucherAccountingDropdownClassName } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import { formatAmount } from "@/app/src/utils/currency.util";

export function createDisbursementAccountingEntryColumns({
  canAddPartyName,
  chartAccounts,
  columnLabels,
  columnWidths,
  isReadonly,
  onAddPartyName,
  onUpdateEntry,
  onUpdateEntryFields,
  partyOptions,
}: DisbursementAccountingEntryColumnsParams): Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>> {
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
          className={DisbursementVoucherAccountingDropdownClassName}
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
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          value={entry.checkNo ?? ""}
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
            className={DisbursementVoucherAccountingDropdownClassName}
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
      widthClassName: "w-[10rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell value={entry.vatType ?? ""} />,
    },
    atcCode: {
      header: columnLabels.atcCode,
      id: "atcCode",
      width: columnWidths.atcCode,
      widthClassName: "w-[10rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell value={entry.atcCode ?? ""} />,
    },
  };
}

export function createDisbursementExpenseEntryColumns({
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
}: DisbursementExpenseEntryColumnsParams): Record<ExpenseEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>> {
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
      renderCell: (entry) => (
        <ChartAccountDropdown
          accounts={expenseAccounts}
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
          className={DisbursementVoucherAccountingDropdownClassName}
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
      renderCell: (entry, _rowIndex, context) => (
        <ModuleDataEntryMoneyCell
          id={context.fieldId}
          name={context.fieldName}
          value={entry.taxDetails.grossAmount}
          readOnly={isReadonly}
          onChange={(value) =>
            updateExpenseEntryFields(entry.id, {
              credit: 0,
              debit: Number(value || 0),
              taxDetails: syncTaxDetailsAmount(entry.taxDetails, Number(value || 0), entry.taxRate),
            })
          }
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
      renderCell: (entry) => <ModuleDataEntryReadonlyCell align="right" value={formatAmount(entry.taxDetails.netAmount)} />,
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
          placeholder="Select VAT Code"
          searchPlaceholder="Search VAT Code"
          className={DisbursementVoucherAccountingDropdownClassName}
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
      ),
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
      renderCell: (entry) => (
        <AppAdvancedDropdown
          value={entry.taxDetails.ewtCode}
          readOnly={isReadonly}
          isClearable
          options={ewtOptions}
          placeholder="Select EWT Code"
          searchPlaceholder="Search EWT Code"
          className={DisbursementVoucherAccountingDropdownClassName}
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
              atcCode: nextEwtCode,
              taxDetails: nextTaxDetails,
            });
          }}
        />
      ),
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
    totalAmountDue: {
      header: expenseColumnLabels.totalAmountDue,
      id: "totalAmountDue",
      width: expenseColumnWidths.totalAmountDue,
      widthClassName: "w-[10rem]",
      renderCell: (entry) => <ModuleDataEntryReadonlyCell align="right" value={formatAmount(entry.taxDetails.amount)} />,
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
      renderCell: (entry) => (
        <AppAdvancedDropdown
          addAction={
            canAddResponsibilityCenter && !isReadonly
              ? {
                  label: "Add Responsibility Center",
                  onClick: () => onAddResponsibilityCenter(entry.id),
                }
              : undefined
          }
          className={DisbursementVoucherAccountingDropdownClassName}
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
      ),
    },
    refId: {
      ...accountingColumns.refId,
      header: expenseColumnLabels.refId,
      id: "refId",
      width: expenseColumnWidths.refId,
    },
  };
}
