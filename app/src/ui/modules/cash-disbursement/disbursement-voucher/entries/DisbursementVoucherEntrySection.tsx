import { useCallback, useMemo, useState } from "react";
import {
  DefaultDisbursementEntryColumnOrder,
  DefaultDisbursementEntryColumnWidths,
  DefaultExpenseEntryColumnOrder,
  DefaultExpenseEntryColumnWidths,
  DefaultVisibleDisbursementEntryColumnOrder,
  DefaultVisibleExpenseEntryColumnOrder,
  DisbursementEntryColumnLabels,
  ExpenseEntryColumnLabels,
  MultiCheckColumnIds,
  ProtectedDisbursementEntryColumnIds,
  ProtectedExpenseEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createAutomaticAccountingEntries,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  getExpenseEntryColumnTotal,
  isDisbursementEntryColumnId,
  isExpenseEntryColumnId,
  isGeneratedAccountingEntry,
  moveEntryColumn,
  syncDisbursementLineEntryTaxDetails,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type {
  DisbursementEntryColumnId,
  DisbursementEntryView,
  ExpenseEntryColumnId,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { getPaymentTypeDetailKind } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherPaymentFields";
import {
  createDisbursementAccountingEntryColumns,
  createDisbursementExpenseEntryColumns,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { createEwtOptions, createVatOptions } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  ParticularsEditorDialog,
  calculateDisbursementEntryColumnFitWidth,
  estimateDisbursementEntryTextWidth,
  formatAccountingAmount,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryCellControls";

const ExpenseEntryView: DisbursementEntryView = "expense";

export function DisbursementVoucherEntrySection(props: VoucherDataEntryProps) {
  const {
    bankAccount,
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
    onReplaceEntries,
    onUpdateEntry,
    onUpdateEntryFields,
    partyCode,
    partyName,
    paymentMethod,
    paymentTypeRecord,
    totalCredit,
    totalDebit,
  } = props;
  const variance = Math.abs(totalDebit - totalCredit);
  const [particularsEditorEntryId, setParticularsEditorEntryId] = useState<string | null>(null);
  const [entryView, setEntryView] = useState<DisbursementEntryView>(ExpenseEntryView);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);
  const [columnOrder, setColumnOrder] = useState<DisbursementEntryColumnId[]>(DefaultDisbursementEntryColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<DisbursementEntryColumnId[]>(DefaultVisibleDisbursementEntryColumnOrder);
  const [columnWidths, setColumnWidths] = useState(DefaultDisbursementEntryColumnWidths);
  const [columnLabels, setColumnLabels] = useState(DisbursementEntryColumnLabels);
  const [expenseColumnOrder, setExpenseColumnOrder] = useState<ExpenseEntryColumnId[]>(DefaultExpenseEntryColumnOrder);
  const [visibleExpenseColumnIds, setVisibleExpenseColumnIds] = useState<ExpenseEntryColumnId[]>(DefaultVisibleExpenseEntryColumnOrder);
  const [expenseColumnWidths, setExpenseColumnWidths] = useState(DefaultExpenseEntryColumnWidths);
  const [expenseColumnLabels, setExpenseColumnLabels] = useState(ExpenseEntryColumnLabels);
  const hasMultiCheckNumberColumn = isMultiCheckNumber && getPaymentTypeDetailKind(paymentMethod, paymentTypeRecord) === "with-bank";
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleColumnIds.includes(columnId),
  );
  const visibleExpenseColumnOrder = expenseColumnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleExpenseColumnIds.includes(columnId),
  );
  const chartAccounts = useMemo(() => createAccountingChartAccountOptions(entries), [entries]);
  const expenseAccounts = useMemo(() => createDefaultAccountExpenseOptions(defaultAccounts), [defaultAccounts]);
  const expenseRows = useMemo(() => entries.filter((entry) => !isGeneratedAccountingEntry(entry)), [entries]);
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherPartyOptions];
    const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
    const customValues = new Set(options.map((option) => option.value));
    const customOptions: AppAdvancedDropdownOption[] = [];

    entries.forEach((entry) => {
      const partyName = (entry.partyName ?? "").trim();
      const value = getAccountingPartyFallbackValue(partyName);

      if (!partyName || optionNames.has(partyName.toLowerCase()) || customValues.has(value)) {
        return;
      }

      customValues.add(value);
      customOptions.push({
        description: "Copied entry party",
        label: entry.partyCode ?? "",
        name: partyName,
        value,
      });
    });

    return [...options, ...customOptions];
  }, [entries]);
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherResponsibilityCenterOptions];
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
  const particularsEditorEntry = entries.find((entry) => entry.id === particularsEditorEntryId) ?? null;

  const updateExpenseEntryFields = useCallback(
    (entryId: string, updates: Partial<DisbursementLineEntry>) => {
      const currentEntry = entries.find((entry) => entry.id === entryId);
      const nextUpdates = applyVoucherPartyToEntryUpdates(currentEntry, updates, partyCode, partyName);
      const isCashPayment = paymentTypeRecord?.type === "Cash" || paymentMethod.trim().toLowerCase() === "cash";
      const updatedEntries = entries.map((entry) =>
        entry.id === entryId
          ? syncDisbursementLineEntryTaxDetails({
              ...entry,
              ...nextUpdates,
            })
          : entry,
      );

      onReplaceEntries(
        createAutomaticAccountingEntries(updatedEntries, {
          bankAccount,
          isCashPayment,
          paymentMethod,
        }),
      );
    },
    [bankAccount, entries, onReplaceEntries, partyCode, partyName, paymentMethod, paymentTypeRecord?.type],
  );

  const allColumns = useMemo(
    () =>
      createDisbursementAccountingEntryColumns({
        canAddPartyName,
        canAddResponsibilityCenter,
        chartAccounts,
        columnLabels,
        columnWidths,
        ewtOptions,
        isReadonly,
        onAddPartyName,
        onAddResponsibilityCenter,
        onOpenParticulars: setParticularsEditorEntryId,
        onUpdateEntry,
        onUpdateEntryFields,
        partyOptions,
        responsibilityCenterOptions,
        vatOptions,
      }),
    [
      canAddPartyName,
      canAddResponsibilityCenter,
      chartAccounts,
      columnLabels,
      columnWidths,
      ewtOptions,
      isReadonly,
      onAddPartyName,
      onAddResponsibilityCenter,
      onUpdateEntry,
      onUpdateEntryFields,
      partyOptions,
      responsibilityCenterOptions,
      setParticularsEditorEntryId,
      vatOptions,
    ],
  );
  const columns = useMemo<ModuleDataEntryColumn<DisbursementLineEntry>[]>(
    () => visibleColumnOrder.map((columnId) => allColumns[columnId]),
    [allColumns, visibleColumnOrder],
  );
  const allExpenseColumns = useMemo(
    () =>
      createDisbursementExpenseEntryColumns({
        accountingColumns: allColumns,
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
      }),
    [
      allColumns,
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
    ],
  );
  const expenseColumns = useMemo<ModuleDataEntryColumn<DisbursementLineEntry>[]>(
    () => visibleExpenseColumnOrder.map((columnId) => allExpenseColumns[columnId]),
    [allExpenseColumns, visibleExpenseColumnOrder],
  );
  const activeColumns = entryView === ExpenseEntryView ? expenseColumns : columns;
  const activeRows = entryView === ExpenseEntryView ? expenseRows : entries;
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder
        .filter((columnId) => !MultiCheckColumnIds.has(columnId) || hasMultiCheckNumberColumn)
        .map((columnId) => ({
          id: columnId,
          isHideable: MultiCheckColumnIds.has(columnId) ? false : !ProtectedDisbursementEntryColumnIds.has(columnId),
          isVisible: MultiCheckColumnIds.has(columnId) || visibleColumnIds.includes(columnId),
          label: columnLabels[columnId],
          width: columnWidths[columnId],
          widthMode: "fixed",
        })),
    [columnLabels, columnOrder, columnWidths, hasMultiCheckNumberColumn, visibleColumnIds],
  );
  const expenseColumnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      expenseColumnOrder
        .filter((columnId) => !MultiCheckColumnIds.has(columnId) || hasMultiCheckNumberColumn)
        .map((columnId) => ({
          id: columnId,
          isHideable: MultiCheckColumnIds.has(columnId) ? false : !ProtectedExpenseEntryColumnIds.has(columnId),
          isVisible: MultiCheckColumnIds.has(columnId) || visibleExpenseColumnIds.includes(columnId),
          label: expenseColumnLabels[columnId],
          width: expenseColumnWidths[columnId],
          widthMode: "fixed",
        })),
    [expenseColumnLabels, expenseColumnOrder, expenseColumnWidths, hasMultiCheckNumberColumn, visibleExpenseColumnIds],
  );

  function updateColumnHeader(columnId: string, header: string) {
    if (entryView === ExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnLabels((currentLabels) => ({
        ...currentLabels,
        [columnId]: header,
      }));
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (entryView === ExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (entryView === ExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      updateColumnWidth(columnId, estimateDisbursementEntryTextWidth(expenseColumnLabels[columnId], 76));
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateDisbursementEntryColumnFitWidth({
        columnId,
        columnLabels,
        entries,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (entryView === ExpenseEntryView && isExpenseEntryColumnId(fromColumnId) && isExpenseEntryColumnId(toColumnId)) {
      setExpenseColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromColumnId, toColumnId));
      return;
    }

    if (!isDisbursementEntryColumnId(fromColumnId) || !isDisbursementEntryColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromColumnId, toColumnId));
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (entryView === ExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      if (!isVisible && ProtectedExpenseEntryColumnIds.has(columnId)) {
        return;
      }

      setVisibleExpenseColumnIds((currentVisibleIds) =>
        updateVisibleEntryColumns(currentVisibleIds, expenseColumnOrder, columnId, isVisible),
      );
      return;
    }

    if (!isDisbursementEntryColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedDisbursementEntryColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => updateVisibleEntryColumns(currentVisibleIds, columnOrder, columnId, isVisible));
  }

  return (
    <section className="min-w-0">
      <div className="min-w-0">
        <ModuleDataEntry
          columns={activeColumns}
          description=""
          emptyRowLabel="entry"
          error={errors.lineEntries}
          columnOptions={entryView === ExpenseEntryView ? expenseColumnOptions : columnOptions}
          summaryCells={
            entryView === "accounting"
              ? {
                  credit: formatAccountingAmount(totalCredit),
                  debit: formatAccountingAmount(totalDebit),
                }
              : {
                  amount: formatAccountingAmount(getExpenseEntryColumnTotal(expenseRows, "amount")),
                  ewtAmount: formatAccountingAmount(getExpenseEntryColumnTotal(expenseRows, "ewtAmount")),
                  netAmount: formatAccountingAmount(getExpenseEntryColumnTotal(expenseRows, "netAmount")),
                  totalAmountDue: formatAccountingAmount(getExpenseEntryColumnTotal(expenseRows, "totalAmountDue")),
                  vatAmount: formatAccountingAmount(getExpenseEntryColumnTotal(expenseRows, "vatAmount")),
                }
          }
          summaryRowHeader="Totals"
          footerDetails={
            <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
              Variance: {formatAccountingAmount(variance)}
            </span>
          }
          isDraggable
          isReadonly={isReadonly}
          rows={activeRows}
          title={
            <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
              {(
                [
                  [ExpenseEntryView, "Expense Details"],
                  ["accounting", "Accounting Entries"],
                ] as const
              ).map(([view, label]) => {
                const isActive = entryView === view;

                return (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setEntryView(view)}
                    className={joinClasses(
                      "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
                      isActive
                        ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                        : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          }
          onAddRows={onAddEntries}
          onAutoColumnWidth={fitColumnWidth}
          onClearRows={onClearEntries}
          onDuplicateRow={onDuplicateEntry}
          onFitColumnWidth={fitColumnWidth}
          onInsertRow={onInsertEntry}
          onMoveColumn={moveColumn}
          onMoveRow={onMoveEntry}
          onRemoveRow={onRemoveEntry}
          onToggleColumnVisibility={toggleColumnVisibility}
          onUpdateColumnHeader={updateColumnHeader}
          onUpdateColumnWidth={updateColumnWidth}
        />
      </div>
      <ParticularsEditorDialog
        key={particularsEditorEntry?.id ?? "closed"}
        entry={particularsEditorEntry}
        isReadonly={isReadonly}
        onClose={() => setParticularsEditorEntryId(null)}
        onSave={(value) => {
          if (!particularsEditorEntry) {
            return;
          }

          onUpdateEntry(particularsEditorEntry.id, "particulars", value);
          setParticularsEditorEntryId(null);
        }}
      />
    </section>
  );
}
