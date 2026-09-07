import { useCallback, useMemo, useState } from "react";
import {
  DefaultDisbursementEntryColumnWidths,
  DisbursementEntryColumnLabels,
  DisbursementVoucherExpenseEntryView,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import { useDisbursementVoucherEntryLookups } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucherEntryLookups";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type {
  DisbursementEntryView,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherAccountingEntryTable";
import { createDisbursementAccountingEntryColumns } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryColumns";
import { DisbursementVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherDetailEntryTable";
import {
  DisbursementVoucherEntryTabs,
  DisbursementVoucherAccountingEntryView,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryTabs";

export function DisbursementVoucherEntrySection(props: VoucherDataEntryProps) {
  const {
    canAddExpenseType,
    canAddPartyName,
    canAddResponsibilityCenter,
    defaultAccounts,
    entries,
    errors,
    isMultiCheckNumber,
    isReadonly,
    onAddEntries,
    onAddExpenseType,
    onAddPartyName,
    onAddResponsibilityCenter,
    onClearEntries,
    onDuplicateEntry,
    onInsertEntry,
    onMoveEntry,
    onRemoveEntry,
    onUpdateEntry,
    onUpdateEntryFields,
    partyOptions: livePartyOptions,
    partyCode,
    partyName,
    paymentMethod,
    paymentTypeRecord,
    responsibilityCenterOptions: liveResponsibilityCenterOptions,
    totalCredit,
    totalDebit,
  } = props;
  const variance = Math.abs(totalDebit - totalCredit);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const isDebitMemo =
    paymentTypeRecord?.type === "Debit Memo" || (paymentMethod ?? "").trim().toLowerCase().includes("debit memo");

  const [entryView, setEntryView] = useState<DisbursementEntryView>(DisbursementVoucherExpenseEntryView);
  const {
    chartAccounts,
    ewtOptions,
    expenseAccounts,
    expenseRows,
    isChartAccountsError,
    isChartAccountsLoading,
    isTaxCodesError,
    isTaxCodesLoading,
    partyOptions,
    responsibilityCenterOptions,
    taxCodes,
    vatOptions,
  } = useDisbursementVoucherEntryLookups({
    activeCompanyId,
    defaultAccounts,
    entries,
    livePartyOptions,
    liveResponsibilityCenterOptions,
  });

  const updateExpenseEntryFields = useCallback(
    (entryId: string, updates: Partial<DisbursementLineEntry>) => {
      const currentEntry = entries.find((entry: DisbursementLineEntry) => entry.id === entryId);
      const nextUpdates = applyVoucherPartyToEntryUpdates(currentEntry, updates, partyCode, partyName);

      onUpdateEntryFields(entryId, nextUpdates);
    },
    [entries, onUpdateEntryFields, partyCode, partyName],
  );

  const accountingColumnLabels = useMemo(() => {
    if (!isDebitMemo) {
      return DisbursementEntryColumnLabels;
    }
    return {
      ...DisbursementEntryColumnLabels,
      checkNo: "Debit Memo No.",
      checkDate: "Debit Memo Date",
      checkStatus: "Debit Memo Status",
    };
  }, [isDebitMemo]);

  const accountingColumns = useMemo(
    () =>
      createDisbursementAccountingEntryColumns({
        canAddPartyName,
        chartAccounts,
        columnLabels: accountingColumnLabels,
        columnWidths: DefaultDisbursementEntryColumnWidths,
        ewtOptions,
        isReadonly,
        onAddPartyName,
        onUpdateEntry,
        onUpdateEntryFields,
        partyOptions,
        taxCodes,
        vatOptions,
      }),
    [
      accountingColumnLabels,
      canAddPartyName,
      chartAccounts,
      ewtOptions,
      isReadonly,
      onAddPartyName,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
      taxCodes,
      vatOptions,
    ],
  );

  if (isChartAccountsError || isTaxCodesError) {
    return (
      <p role="alert" className="rounded-lg border border-coralpink/30 bg-coralpink/5 px-4 py-3 text-sm text-darknavy">
        Disbursement voucher entry lookups could not be loaded. Please refresh the page.
      </p>
    );
  }

  if (isChartAccountsLoading || isTaxCodesLoading) {
    return (
      <p className="rounded-lg border border-darknavy/10 bg-white px-4 py-3 text-sm text-darknavy">
        Loading disbursement voucher entry lookups...
      </p>
    );
  }

  if (entryView === DisbursementVoucherAccountingEntryView) {
    return (
      <DisbursementVoucherAccountingEntryTable
        accountingColumns={accountingColumns}
        accountingRows={entries}
        errors={errors}
        isDebitMemo={isDebitMemo}
        isMultiCheckNumber={isMultiCheckNumber}
        isReadonly={isReadonly}
        title={<DisbursementVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
        totalCredit={totalCredit}
        totalDebit={totalDebit}
        variance={variance}
        onAddEntries={onAddEntries}
        onClearEntries={onClearEntries}
        onDuplicateEntry={onDuplicateEntry}
        onInsertEntry={onInsertEntry}
        onMoveEntry={onMoveEntry}
        onRemoveEntry={onRemoveEntry}
      />
    );
  }

  return (
    <DisbursementVoucherDetailEntryTable
      accountingColumns={accountingColumns}
      canAddExpenseType={canAddExpenseType}
      canAddResponsibilityCenter={canAddResponsibilityCenter}
      errors={errors}
      ewtOptions={ewtOptions}
      expenseAccounts={expenseAccounts}
      expenseRows={expenseRows}
      isDebitMemo={isDebitMemo}
      isMultiCheckNumber={isMultiCheckNumber}
      isReadonly={isReadonly}
      title={<DisbursementVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
      onAddEntries={onAddEntries}
      onAddExpenseType={onAddExpenseType}
      onAddResponsibilityCenter={onAddResponsibilityCenter}
      onClearEntries={onClearEntries}
      onDuplicateEntry={onDuplicateEntry}
      onInsertEntry={onInsertEntry}
      onMoveEntry={onMoveEntry}
      onRemoveEntry={onRemoveEntry}
      responsibilityCenterOptions={responsibilityCenterOptions}
      taxCodes={taxCodes}
      updateExpenseEntryFields={updateExpenseEntryFields}
      vatOptions={vatOptions}
    />
  );
}

