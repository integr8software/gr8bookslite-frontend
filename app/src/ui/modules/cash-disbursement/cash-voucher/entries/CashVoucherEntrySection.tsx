import { useCallback, useMemo, useState } from "react";
import {
  CashVoucherEntryColumnLabels,
  CashVoucherExpenseEntryView,
  DefaultCashVoucherEntryColumnWidths,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createAutomaticAccountingEntries,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  isGeneratedAccountingEntry,
  normalizeCashVoucherLineEntryFields,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import {
  CashVoucherPartyOptions,
  CashVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherTaxData";
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

const CashVoucherAccountingEntryView: CashVoucherEntryView = "accounting";
const CashVoucherEntryTabs: { id: CashVoucherEntryView; label: string }[] = [
  { id: CashVoucherExpenseEntryView, label: "Line Entries" },
  { id: CashVoucherAccountingEntryView, label: "Accounting Entries" },
];

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
    onReplaceEntries,
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
      const updatedEntries = entries.map((entry) =>
        entry.id === entryId
          ? normalizeCashVoucherLineEntryFields({
              ...entry,
              ...nextUpdates,
            })
          : entry,
      );

      onReplaceEntries(
        createAutomaticAccountingEntries(updatedEntries, {
          bankAccount: null,
          isCashPayment: true,
          paymentMethod: "Cash",
        }),
      );
    },
    [entries, onReplaceEntries, partyCode, partyName],
  );

  const accountingColumns = useMemo(
    () =>
      createCashVoucherAccountingEntryColumns({
        canAddPartyName,
        chartAccounts,
        columnLabels: CashVoucherEntryColumnLabels,
        columnWidths: DefaultCashVoucherEntryColumnWidths,
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
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div
          role="tablist"
          aria-label="Cash voucher lines"
          className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
        >
          {CashVoucherEntryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={entryView === tab.id}
              onClick={() => setEntryView(tab.id as CashVoucherEntryView)}
              className={[
                "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
                entryView === tab.id
                  ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                  : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {entryView === CashVoucherAccountingEntryView ? (
        <CashVoucherAccountingEntryTable
          accountingColumns={accountingColumns}
          accountingRows={entries}
          errors={errors}
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          variance={variance}
        />
      ) : (
        <CashVoucherDetailEntryTable
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
    </section>
  );
}
