import { useCallback, useMemo, useState } from "react";
import {
  DefaultCashVoucherEntryColumnOrder,
  DefaultCashVoucherEntryColumnWidths,
  DefaultExpenseEntryColumnOrder,
  DefaultExpenseEntryColumnWidths,
  DefaultVisibleCashVoucherEntryColumnOrder,
  DefaultVisibleExpenseEntryColumnOrder,
  CashVoucherEntryColumnLabels,
  CashVoucherExpenseEntryView,
  ExpenseEntryColumnLabels,
  MultiCheckColumnIds,
  ProtectedCashVoucherEntryColumnIds,
  ProtectedExpenseEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  applyVoucherPartyToEntryUpdates,
  createAccountingChartAccountOptions,
  createAutomaticAccountingEntries,
  createDefaultAccountExpenseOptions,
  getAccountingPartyFallbackValue,
  getExpenseEntryColumnTotal,
  isCashVoucherEntryColumnId,
  isExpenseEntryColumnId,
  isGeneratedAccountingEntry,
  moveEntryColumn,
  syncCashVoucherLineEntryTaxDetails,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import {
  CashVoucherPartyOptions,
  CashVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import type {
  CashVoucherEntryColumnId,
  CashVoucherEntryView,
  ExpenseEntryColumnId,
  VoucherDataEntryProps,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import {
  createCashVoucherAccountingEntryColumns,
  createCashVoucherExpenseEntryColumns,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { createEwtOptions, createVatOptions } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherTaxData";
import { formatAmount } from "@/app/src/utils/currency.util";
import {
  calculateCashVoucherEntryColumnFitWidth,
  estimateCashVoucherEntryTextWidth,
} from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryCellControls";

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
  const [columnOrder, setColumnOrder] = useState<CashVoucherEntryColumnId[]>(DefaultCashVoucherEntryColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<CashVoucherEntryColumnId[]>(DefaultVisibleCashVoucherEntryColumnOrder);
  const [columnWidths, setColumnWidths] = useState(DefaultCashVoucherEntryColumnWidths);
  const [columnLabels, setColumnLabels] = useState(CashVoucherEntryColumnLabels);
  const [expenseColumnOrder, setExpenseColumnOrder] = useState<ExpenseEntryColumnId[]>(DefaultExpenseEntryColumnOrder);
  const [visibleExpenseColumnIds, setVisibleExpenseColumnIds] = useState<ExpenseEntryColumnId[]>(DefaultVisibleExpenseEntryColumnOrder);
  const [expenseColumnWidths, setExpenseColumnWidths] = useState(DefaultExpenseEntryColumnWidths);
  const [expenseColumnLabels, setExpenseColumnLabels] = useState(ExpenseEntryColumnLabels);
  const hasMultiCheckNumberColumn = false;
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
    const options: AppAdvancedDropdownOption[] = [...CashVoucherPartyOptions];
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
          ? syncCashVoucherLineEntryTaxDetails({
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

  const allColumns = useMemo(
    () =>
      createCashVoucherAccountingEntryColumns({
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
      vatOptions,
    ],
  );
  const columns = useMemo<ModuleDataEntryColumn<CashVoucherLineEntry>[]>(
    () => visibleColumnOrder.map((columnId) => allColumns[columnId]),
    [allColumns, visibleColumnOrder],
  );
  const allExpenseColumns = useMemo(
    () =>
      createCashVoucherExpenseEntryColumns({
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
  const expenseColumns = useMemo<ModuleDataEntryColumn<CashVoucherLineEntry>[]>(
    () => visibleExpenseColumnOrder.map((columnId) => allExpenseColumns[columnId]),
    [allExpenseColumns, visibleExpenseColumnOrder],
  );
  const activeColumns = entryView === CashVoucherExpenseEntryView ? expenseColumns : columns;
  const activeRows = entryView === CashVoucherExpenseEntryView ? expenseRows : entries;
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder
        .filter((columnId) => !MultiCheckColumnIds.has(columnId) || hasMultiCheckNumberColumn)
        .map((columnId) => ({
          id: columnId,
          isHideable: MultiCheckColumnIds.has(columnId) ? false : !ProtectedCashVoucherEntryColumnIds.has(columnId),
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
    if (entryView === CashVoucherExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnLabels((currentLabels) => ({
        ...currentLabels,
        [columnId]: header,
      }));
      return;
    }

    if (!isCashVoucherEntryColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (entryView === CashVoucherExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      setExpenseColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
      return;
    }

    if (!isCashVoucherEntryColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (entryView === CashVoucherExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      updateColumnWidth(columnId, estimateCashVoucherEntryTextWidth(expenseColumnLabels[columnId], 76));
      return;
    }

    if (!isCashVoucherEntryColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateCashVoucherEntryColumnFitWidth({
        columnId,
        columnLabels,
        entries,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (entryView === CashVoucherExpenseEntryView && isExpenseEntryColumnId(fromColumnId) && isExpenseEntryColumnId(toColumnId)) {
      setExpenseColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromColumnId, toColumnId));
      return;
    }

    if (!isCashVoucherEntryColumnId(fromColumnId) || !isCashVoucherEntryColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromColumnId, toColumnId));
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (entryView === CashVoucherExpenseEntryView && isExpenseEntryColumnId(columnId)) {
      if (!isVisible && ProtectedExpenseEntryColumnIds.has(columnId)) {
        return;
      }

      setVisibleExpenseColumnIds((currentVisibleIds) =>
        updateVisibleEntryColumns(currentVisibleIds, expenseColumnOrder, columnId, isVisible),
      );
      return;
    }

    if (!isCashVoucherEntryColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedCashVoucherEntryColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => updateVisibleEntryColumns(currentVisibleIds, columnOrder, columnId, isVisible));
  }

  function resetColumns() {
    if (entryView === CashVoucherExpenseEntryView) {
      setExpenseColumnOrder([...DefaultExpenseEntryColumnOrder]);
      setVisibleExpenseColumnIds([...DefaultVisibleExpenseEntryColumnOrder]);
      setExpenseColumnWidths({ ...DefaultExpenseEntryColumnWidths });
      setExpenseColumnLabels({ ...ExpenseEntryColumnLabels });
      return;
    }

    setColumnOrder([...DefaultCashVoucherEntryColumnOrder]);
    setVisibleColumnIds([...DefaultVisibleCashVoucherEntryColumnOrder]);
    setColumnWidths({ ...DefaultCashVoucherEntryColumnWidths });
    setColumnLabels({ ...CashVoucherEntryColumnLabels });
  }

  return (
    <section className="min-w-0">
      <div className="min-w-0">
        <ModuleDataEntry
          columns={activeColumns}
          description=""
          emptyRowLabel="entry"
          error={errors.lineEntries}
          columnOptions={entryView === CashVoucherExpenseEntryView ? expenseColumnOptions : columnOptions}
          summaryCells={
            entryView === "accounting"
              ? {
                  credit: formatAmount(totalCredit),
                  debit: formatAmount(totalDebit),
                }
              : {
                  amount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "amount")),
                  ewtAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "ewtAmount")),
                  netAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "netAmount")),
                  totalAmountDue: formatAmount(getExpenseEntryColumnTotal(expenseRows, "totalAmountDue")),
                  vatAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "vatAmount")),
                }
          }
          summaryRowHeader="Totals"
          footerDetails={
            <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
              Variance: {formatAmount(variance)}
            </span>
          }
          isDraggable
          isReadonly={isReadonly}
          rows={activeRows}
          title={
            <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
              {(
                [
                  [CashVoucherExpenseEntryView, "Disbursement Details"],
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
          onResetColumns={resetColumns}
          onToggleColumnVisibility={toggleColumnVisibility}
          onUpdateColumnHeader={updateColumnHeader}
          onUpdateColumnWidth={updateColumnWidth}
        />
      </div>
    </section>
  );
}


