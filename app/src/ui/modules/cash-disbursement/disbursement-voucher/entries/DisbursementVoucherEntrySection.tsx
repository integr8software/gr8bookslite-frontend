import { useCallback, useMemo, useState } from "react";
import {
  DefaultDisbursementEntryColumnWidths,
  DisbursementEntryColumnLabels,
  DisbursementVoucherExpenseEntryView,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createAutomaticAccountingEntries,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
  normalizeDisbursementLineEntryFields,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type {
  DisbursementEntryView,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { DisbursementVoucherAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherAccountingEntryTable";
import { createDisbursementAccountingEntryColumns } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryColumns";
import { DisbursementVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";
import { createEwtOptions, createVatOptions } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

const EntryTabs: { id: DisbursementEntryView; label: string }[] = [
  { id: "expense", label: "Line Entries" },
  { id: "accounting", label: "Accounting Entries" },
];

export function DisbursementVoucherEntrySection(props: VoucherDataEntryProps) {
  const {
    bankAccount,
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
    onReplaceEntries,
    onUpdateEntry,
    onUpdateEntryFields,
    partyCode,
    partyName,
    paymentMethod,
    totalCredit,
    totalDebit,
  } = props;

  const [entryView, setEntryView] = useState<DisbursementEntryView>(DisbursementVoucherExpenseEntryView);
  const variance = Math.abs(totalDebit - totalCredit);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const chartAccounts = useMemo(() => createAccountingChartAccountOptions(entries), [entries]);
  const expenseAccounts = useMemo(() => createDefaultAccountExpenseOptions(defaultAccounts), [defaultAccounts]);
  const expenseRows = useMemo(() => entries.filter((entry: DisbursementLineEntry) => !isGeneratedAccountingEntry(entry)), [entries]);

  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherPartyOptions];
    const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
    const customValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry: DisbursementLineEntry) => {
      const currentPartyName = (entry.partyName ?? "").trim();
      const value = getAccountingPartyFallbackValue(currentPartyName);

      if (!currentPartyName || optionNames.has(currentPartyName.toLowerCase()) || customValues.has(value)) {
        return;
      }

      customValues.add(value);
      customOptions.push({
        description: "Copied entry party",
        label: entry.partyCode ?? "",
        name: currentPartyName,
        value,
      });
    });

    return [...options, ...customOptions];
  }, [entries]);

  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherResponsibilityCenterOptions];
    const optionValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry: DisbursementLineEntry) => {
      const responsibilityCenter = (entry.responsibilityCenter ?? "").trim();

      if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
        return;
      }

      optionValues.add(responsibilityCenter);
      customOptions.push({
        description: "Copied responsibility center",
        label: responsibilityCenter,
        name: responsibilityCenter,
        value: responsibilityCenter,
      });
    });

    return [...options, ...customOptions];
  }, [entries]);

  const updateExpenseEntryFields = useCallback(
    (entryId: string, updates: Partial<DisbursementLineEntry>) => {
      const currentEntry = entries.find((entry: DisbursementLineEntry) => entry.id === entryId);
      const nextUpdates = applyVoucherPartyToEntryUpdates(currentEntry, updates, partyCode, partyName);
      const updatedEntries = entries.map((entry: DisbursementLineEntry) =>
        entry.id === entryId
          ? normalizeDisbursementLineEntryFields({
              ...entry,
              ...nextUpdates,
            })
          : entry,
      );

      onReplaceEntries(
        createAutomaticAccountingEntries(updatedEntries, {
          bankAccount,
          paymentMethod,
        }),
      );
    },
    [bankAccount, entries, onReplaceEntries, partyCode, partyName, paymentMethod],
  );

  const accountingColumns = useMemo(
    () =>
      createDisbursementAccountingEntryColumns({
        canAddPartyName,
        chartAccounts,
        columnLabels: DisbursementEntryColumnLabels,
        columnWidths: DefaultDisbursementEntryColumnWidths,
        isReadonly,
        onAddPartyName,
        onUpdateEntry,
        onUpdateEntryFields,
        partyOptions,
      }),
    [
      canAddPartyName,
      chartAccounts,
      isReadonly,
      onAddPartyName,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
    ],
  );

  return (
    <ModuleDataEntryTabs
      activeTab={entryView}
      ariaLabel="Disbursement voucher lines"
      onTabChange={setEntryView}
      tabs={EntryTabs}
    >
      {entryView === "accounting" ? (
        <DisbursementVoucherAccountingEntryTable
          accountingColumns={accountingColumns}
          accountingRows={entries}
          errors={errors}
          isReadonly={isReadonly}
          onAddEntries={onAddEntries}
          onClearEntries={onClearEntries}
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          variance={variance}
        />
      ) : (
        <DisbursementVoucherDetailEntryTable
          accountingColumns={accountingColumns}
          canAddExpenseType={canAddExpenseType}
          canAddResponsibilityCenter={canAddResponsibilityCenter}
          errors={errors}
          ewtOptions={ewtOptions}
          expenseAccounts={expenseAccounts}
          expenseRows={expenseRows}
          isReadonly={isReadonly}
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
      )}
    </ModuleDataEntryTabs>
  );
}
