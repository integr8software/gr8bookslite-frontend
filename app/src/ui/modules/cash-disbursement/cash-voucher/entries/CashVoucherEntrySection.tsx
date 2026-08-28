import { useCallback, useMemo, useState } from "react";
import {
  CashVoucherEntryColumnLabels,
  CashVoucherExpenseEntryView,
  DefaultCashVoucherEntryColumnWidths,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import {
  CashVoucherPartyOptions,
  CashVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type {
  CashVoucherEntryView,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
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
    partyCode,
    partyName,
    totalCredit,
    totalDebit,
  } = props;
  const variance = Math.abs(totalDebit - totalCredit);

  const [entryView, setEntryView] = useState<CashVoucherEntryView>(CashVoucherExpenseEntryView);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const chartAccounts = useMemo(() => createAccountingChartAccountOptions(entries), [entries]);
  const expenseAccounts = useMemo(() => createDefaultAccountExpenseOptions(defaultAccounts), [defaultAccounts]);
  const expenseRows = useMemo(() => entries.filter((entry) => !isGeneratedAccountingEntry(entry)), [entries]);

  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...CashVoucherPartyOptions];
    const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
    const customValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry) => {
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
    const options: AppAdvancedDropdownOption[] = [...CashVoucherResponsibilityCenterOptions];
    const optionValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry) => {
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
