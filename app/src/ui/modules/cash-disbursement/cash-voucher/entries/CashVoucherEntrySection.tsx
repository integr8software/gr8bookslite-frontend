import { useCallback, useMemo, useState } from "react";
import {
  CashVoucherEntryColumnLabels,
  CashVoucherExpenseEntryView,
  DefaultCashVoucherEntryColumnWidths,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { useCashVoucherEntryLookups } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucherEntryLookups";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type {
  CashVoucherEntryView,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { CashVoucherAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherAccountingEntryTable";
import { createCashVoucherAccountingEntryColumns } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import { CashVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherDetailEntryTable";
import {
  CashVoucherEntryTabs,
  CashVoucherAccountingEntryView,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryTabs";

export function CashVoucherEntrySection(props: VoucherDataEntryProps) {
  const {
    canAddExpenseType,
    canAddPartyName,
    canAddResponsibilityCenter,
    defaultAccounts,
    entries,
    errors,
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
    responsibilityCenterOptions: liveResponsibilityCenterOptions,
    totalCredit,
    totalDebit,
  } = props;
  const variance = Math.abs(totalDebit - totalCredit);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  const [entryView, setEntryView] = useState<CashVoucherEntryView>(CashVoucherExpenseEntryView);
  const {
    chartAccounts,
    ewtOptions,
    expenseAccounts,
    expenseRows,
    partyOptions,
    responsibilityCenterOptions,
    taxCodes,
    vatOptions,
  } = useCashVoucherEntryLookups({
    activeCompanyId,
    defaultAccounts,
    entries,
    livePartyOptions,
    liveResponsibilityCenterOptions,
  });

  const updateExpenseEntryFields = useCallback(
    (entryId: string, updates: Partial<CashVoucherLineEntry>) => {
      const currentEntry = entries.find((entry) => entry.id === entryId);
      const nextUpdates = applyVoucherPartyToEntryUpdates(currentEntry, updates, partyCode, partyName);

      onUpdateEntryFields(entryId, nextUpdates);
    },
    [entries, onUpdateEntryFields, partyCode, partyName],
  );

  const accountingColumns = useMemo(
    () =>
      createCashVoucherAccountingEntryColumns({
        canAddPartyName,
        chartAccounts,
        columnLabels: CashVoucherEntryColumnLabels,
        columnWidths: DefaultCashVoucherEntryColumnWidths,
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

  if (entryView === CashVoucherAccountingEntryView) {
    return (
      <CashVoucherAccountingEntryTable
        accountingColumns={accountingColumns}
        accountingRows={entries}
        errors={errors}
        isReadonly={isReadonly}
        title={<CashVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
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
    <CashVoucherDetailEntryTable
      accountingColumns={accountingColumns}
      canAddExpenseType={canAddExpenseType}
      canAddResponsibilityCenter={canAddResponsibilityCenter}
      errors={errors}
      ewtOptions={ewtOptions}
      expenseAccounts={expenseAccounts}
      expenseRows={expenseRows}
      isReadonly={isReadonly}
      title={<CashVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />}
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

