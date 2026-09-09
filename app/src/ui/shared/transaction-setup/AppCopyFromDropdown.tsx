"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ChevronDown, Copy, RefreshCw, Search } from "lucide-react";
import { AmountRangePicker, type AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker, type DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleResizableDialog } from "@/app/src/ui/shared/module/ModuleResizableDialog";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
export type { AppCopyFromRecord };

type AppCopyFromFiltersValue = {
  amountRange: AmountRangeValue;
  dateRange: DateRangeValue;
  query: string;
};

const EmptyCopyFromFilters: AppCopyFromFiltersValue = {
  amountRange: { from: "", to: "" },
  dateRange: { from: "", to: "" },
  query: "",
};

const CopyFromPageSize = 10;
const CopyFromPageSizeOptions = [5, 10, 15, 20, 25, 50];

export function AppCopyFromDropdown({
  disabled = false,
  enableSourceSearch = false,
  lockedPartyName,
  records,
  restrictToSameParty = false,
  selectionMode = "multiple",
  sources,
  onApply,
}: {
  disabled?: boolean;
  enableSourceSearch?: boolean;
  lockedPartyName?: string;
  records: AppCopyFromRecord[];
  restrictToSameParty?: boolean;
  selectionMode?: "multiple" | "single";
  sources: string[];
  onApply: (recordIds: string[]) => void;
}) {
  const availableSources = useMemo(() => sources.filter((source) => source.trim() !== ""), [sources]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sourceQuery, setSourceQuery] = useState("");
  const [activeSource, setActiveSource] = useState("");
  const [filters, setFilters] = useState<AppCopyFromFiltersValue>(EmptyCopyFromFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: CopyFromPageSize,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const availableSourceSet = useMemo(() => new Set(availableSources), [availableSources]);
  const filteredSources = useMemo(() => {
    const normalizedQuery = sourceQuery.trim().toLowerCase();

    return enableSourceSearch && normalizedQuery
      ? availableSources.filter((source) => source.toLowerCase().includes(normalizedQuery))
      : availableSources;
  }, [availableSources, enableSourceSearch, sourceQuery]);
  const isDialogOpen = activeSource !== "";
  const sourceRecords = useMemo(
    () => records.filter((record) => availableSourceSet.has(record.source) && record.source === activeSource),
    [activeSource, availableSourceSet, records],
  );
  const filteredRecords = useMemo(() => filterCopyFromRecords(sourceRecords, filters), [filters, sourceRecords]);
  const selectedRecords = useMemo(() => sourceRecords.filter((record) => selectedIds.includes(record.id)), [selectedIds, sourceRecords]);
  const selectedTotalAmount = selectedRecords.reduce((total, record) => total + parseCopyFromAmount(record.amount), 0);

  // Compute disabled record IDs, their reasons, and current active party name
  const { activePartyDisplayName, disabledIds, disabledReasons } = useMemo(() => {
    const disabledSet = new Set<string>();
    const reasons = new Map<string, string>();

    // 1. Mark records with explicit disabled flag (e.g., already copied to entries)
    for (const record of sourceRecords) {
      if (record.disabled) {
        disabledSet.add(record.id);
        reasons.set(record.id, record.disabledReason || "Already added");
      }
    }

    // 2. Party restriction
    let activeParty = "";
    let displayName = "";
    if (restrictToSameParty) {
      const normalizedLockedParty = lockedPartyName?.trim().toLowerCase() ?? "";
      if (normalizedLockedParty) {
        activeParty = normalizedLockedParty;
        displayName = lockedPartyName?.trim() ?? "";
      } else if (selectedIds.length > 0) {
        const firstSelectedRecord = sourceRecords.find((record) => selectedIds.includes(record.id));
        if (firstSelectedRecord?.partyName) {
          activeParty = firstSelectedRecord.partyName.trim().toLowerCase();
          displayName = firstSelectedRecord.partyName.trim();
        }
      }

      if (activeParty) {
        for (const record of sourceRecords) {
          if (!disabledSet.has(record.id)) {
            const recParty = record.partyName?.trim().toLowerCase() ?? "";
            if (recParty && recParty !== activeParty) {
              disabledSet.add(record.id);
              reasons.set(record.id, `Different party (${record.partyName})`);
            }
          }
        }
      }
    }

    return {
      activePartyDisplayName: displayName,
      disabledIds: disabledSet,
      disabledReasons: reasons,
    };
  }, [lockedPartyName, restrictToSameParty, selectedIds, sourceRecords]);

  useEffect(() => {
    if (!isMenuOpen && !isDialogOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDialog();
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDialogOpen, isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  function openSource(source: string) {
    setActiveSource(source);
    setSelectedIds([]);
    setFilters(EmptyCopyFromFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
    setIsMenuOpen(false);
  }

  function updateFilters(nextFilters: AppCopyFromFiltersValue) {
    setFilters(nextFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function closeDialog() {
    setActiveSource("");
    setSelectedIds([]);
    setFilters(EmptyCopyFromFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function toggleRecord(recordId: string) {
    if (disabledIds.has(recordId)) {
      return;
    }

    setSelectedIds((currentIds) => {
      if (selectionMode === "single") {
        return currentIds.includes(recordId) ? [] : [recordId];
      }

      return currentIds.includes(recordId) ? currentIds.filter((currentId) => currentId !== recordId) : [...currentIds, recordId];
    });
  }

  function toggleBatch(recordIds: string[], shouldSelect: boolean) {
    setSelectedIds((currentIds) => {
      if (!shouldSelect) {
        const toRemove = new Set(recordIds);
        return currentIds.filter((id) => !toRemove.has(id));
      }

      // If restrictToSameParty, ensure all added IDs belong to the same party
      if (restrictToSameParty) {
        const normalizedLockedParty = lockedPartyName?.trim().toLowerCase() ?? "";
        const activeParty =
          normalizedLockedParty ||
          (() => {
            if (currentIds.length > 0) {
              const first = sourceRecords.find((r) => currentIds.includes(r.id));
              return first?.partyName?.trim().toLowerCase() ?? "";
            }
            const firstNew = sourceRecords.find((r) => recordIds.includes(r.id));
            return firstNew?.partyName?.trim().toLowerCase() ?? "";
          })();

        if (activeParty) {
          const validNewIds = recordIds.filter((id) => {
            if (disabledIds.has(id)) return false;
            const rec = sourceRecords.find((r) => r.id === id);
            return (rec?.partyName?.trim().toLowerCase() ?? "") === activeParty;
          });
          return Array.from(new Set([...currentIds, ...validNewIds]));
        }
      }

      const selectableOnly = recordIds.filter((id) => !disabledIds.has(id));
      return Array.from(new Set([...currentIds, ...selectableOnly]));
    });
  }

  function applySelection() {
    if (selectedIds.length === 0) {
      return;
    }

    onApply(selectedIds);
    closeDialog();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={disabled || availableSources.length === 0}
        onClick={() => {
          setSourceQuery("");
          setIsMenuOpen((current) => !current);
        }}
        className={moduleHeaderActionClassNames.secondary}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Copy From
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-[120] mt-2 grid w-80 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-sm shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
        >
          {enableSourceSearch ? (
            <label className="flex h-10 items-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 focus-within:border-skyblue/45 focus-within:ring-2 focus-within:ring-skyblue/15">
              <Search className="h-4 w-4 shrink-0 text-darknavy/35" aria-hidden="true" />
              <span className="sr-only">Search Copy From modules</span>
              <input
                autoFocus
                value={sourceQuery}
                onChange={(event) => setSourceQuery(event.target.value)}
                placeholder="Search modules"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-darknavy outline-none placeholder:text-darknavy/35"
              />
            </label>
          ) : null}
          <div className="max-h-80 overflow-y-auto">
            {filteredSources.length > 0 ? (
              filteredSources.map((source) => (
                <button
                  key={source}
                  type="button"
                  role="menuitem"
                  onClick={() => openSource(source)}
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 text-left font-semibold text-darknavy transition hover:bg-skyblue/10 hover:text-darknavy"
                >
                  <span className="min-w-0 truncate">{source}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs font-medium text-darknavy/50">No modules found.</p>
            )}
          </div>
        </div>
      ) : null}
      <AppCopyFromSourceDialog
        activePartyDisplayName={activePartyDisplayName}
        activeSource={activeSource}
        disabledIds={disabledIds}
        disabledReasons={disabledReasons}
        filters={filters}
        filteredRecords={filteredRecords}
        isOpen={isDialogOpen}
        lockedPartyName={lockedPartyName}
        pagination={pagination}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        selectedTotalAmount={selectedTotalAmount}
        onApply={applySelection}
        onClearSelection={() => setSelectedIds([])}
        onClose={closeDialog}
        onFiltersChange={updateFilters}
        onPaginationChange={setPagination}
        onToggleBatch={toggleBatch}
        onToggleRecord={toggleRecord}
      />
    </div>
  );
}

export function AppCopyFromSourceDialog({
  activePartyDisplayName,
  activeSource,
  disabledIds = new Set(),
  disabledReasons = new Map(),
  filters,
  filteredRecords,
  isOpen,
  lockedPartyName,
  pagination,
  selectionMode,
  selectedIds,
  selectedTotalAmount,
  onApply,
  onClearSelection,
  onClose,
  onFiltersChange,
  onPaginationChange,
  onToggleBatch,
  onToggleRecord,
}: {
  activePartyDisplayName?: string;
  activeSource: string;
  disabledIds?: Set<string>;
  disabledReasons?: Map<string, string>;
  filters: AppCopyFromFiltersValue;
  filteredRecords: AppCopyFromRecord[];
  isOpen: boolean;
  lockedPartyName?: string;
  pagination: PaginationState;
  selectionMode: "multiple" | "single";
  selectedIds: string[];
  selectedTotalAmount: number;
  onApply: () => void;
  onClearSelection?: () => void;
  onClose: () => void;
  onFiltersChange: (value: AppCopyFromFiltersValue) => void;
  onPaginationChange: (value: PaginationState | ((current: PaginationState) => PaginationState)) => void;
  onToggleBatch?: (recordIds: string[], shouldSelect: boolean) => void;
  onToggleRecord: (recordId: string) => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
  const columns = useMemo<ColumnDef<AppCopyFromRecord>[]>(
    () => [
      {
        id: "selection",
        enableSorting: false,
        size: 56,
        minSize: 56,
        maxSize: 56,
        meta: {
          className:
            "sticky left-0 z-30 !w-14 bg-slate-50 !px-0 text-center first:!pl-0 last:!pr-0 shadow-[6px_0_12px_rgba(33,39,56,0.08)]",
        },
        header: ({ table }) => {
          if (selectionMode === "single") {
            return <span className="text-xs font-semibold text-darknavy/65">Choose</span>;
          }

          const visibleRecordIds = table.getRowModel().rows.map((row) => row.original.id);
          const selectableRecordIds = visibleRecordIds.filter((recordId) => !disabledIds.has(recordId));
          const hasSelectableRows = selectableRecordIds.length > 0;
          const isAllSelectableSelected = hasSelectableRows && selectableRecordIds.every((recordId) => selectedIds.includes(recordId));
          const isPartiallySelected = selectableRecordIds.some((recordId) => selectedIds.includes(recordId)) && !isAllSelectableSelected;

          return (
            <input
              type="checkbox"
              checked={isAllSelectableSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isPartiallySelected;
                }
              }}
              disabled={!hasSelectableRows}
              onChange={() => {
                if (!hasSelectableRows) {
                  return;
                }

                if (onToggleBatch) {
                  onToggleBatch(selectableRecordIds, !isAllSelectableSelected);
                  return;
                }

                if (isAllSelectableSelected) {
                  selectableRecordIds.forEach((recordId) => {
                    if (selectedIds.includes(recordId)) {
                      onToggleRecord(recordId);
                    }
                  });
                  return;
                }

                selectableRecordIds.forEach((recordId) => {
                  if (!selectedIds.includes(recordId)) {
                    onToggleRecord(recordId);
                  }
                });
              }}
              className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Select visible copy from rows"
            />
          );
        },
      },
      {
        accessorKey: "sourceNo",
        header: "Transaction No",
        size: 190,
      },
      {
        accessorKey: "documentDate",
        header: "Transaction Date",
        size: 190,
      },
      {
        accessorKey: "partyName",
        header: "Party Name",
        size: 190,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 240,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 160,
        meta: { className: "text-right tabular-nums" },
      },
    ],
    [disabledIds, onToggleBatch, onToggleRecord, selectedIds, selectionMode],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is the shared table engine for module dialogs.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,
    state: { pagination },
  });

  function refreshRecords() {
    setIsRefreshing(true);
    setLastRefreshedAt(new Date());
    onPaginationChange((current) => ({ ...current, pageIndex: 0 }));
    window.setTimeout(() => setIsRefreshing(false), 500);
  }

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <ModuleResizableDialog
      actions={<AppCopyFromDialogActions lastRefreshedAt={lastRefreshedAt} />}
      bodyClassName="flex min-h-0 flex-col p-0"
      closeLabel="Close copy from dialog"
      description={
        selectionMode === "single"
          ? "Select one source transaction to copy into this voucher."
          : "Select one or more source transactions to copy into this voucher."
      }
      footer={<AppCopyFromFooter selectedCount={selectedIds.length} selectedTotalAmount={selectedTotalAmount} onApply={onApply} />}
      footerClassName="px-5 py-4"
      isOpen={isOpen}
      normalClassName="h-[calc(100dvh-2rem)] max-h-[47rem] max-w-[96rem]"
      title={`Copy From ${activeSource}`}
      titleId="copy-from-dialog-title"
      onClose={onClose}
    >
      {activePartyDisplayName ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 bg-sky-50/80 px-5 py-2.5 text-xs text-darknavy">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-skyblue" />
            <span>
              Transactions restricted to: <strong className="font-semibold text-darknavy">{activePartyDisplayName}</strong>
            </span>
            <span className="text-darknavy/50">
              (Transactions from other parties cannot be selected)
            </span>
          </div>
          {!lockedPartyName && onClearSelection && selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-semibold text-skyblue hover:underline"
            >
              Clear selection to choose another party
            </button>
          ) : null}
        </div>
      ) : null}
      <ModuleTable
        enableColumnReorder={false}
        emptyDescription="Try a different source number, party, amount, date, or remarks."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No transactions found"
        maxHeightClassName="min-h-0 flex-1"
        minWidthClassName="min-w-[70rem]"
        pageSizeOptions={CopyFromPageSizeOptions}
        paginationDensity="compact"
        paginationLabel="transactions"
        paginationStorageKey={`copy-from:${activeSource}:default-10`}
        renderRow={({ id, original }) => {
          const isSelected = selectedIds.includes(original.id);
          const isDisabled = disabledIds.has(original.id);
          const disabledReason = disabledReasons.get(original.id);

          return (
            <tr
              key={id}
              onClick={(event) => {
                if (isDisabled) {
                  return;
                }

                const target = event.target;
                if (target instanceof HTMLElement && target.closest("input, button, a, select, textarea, label")) {
                  return;
                }

                onToggleRecord(original.id);
              }}
              className={joinClasses(
                "module-table-row border-b border-darknavy/8 last:border-b-0",
                isDisabled ? "cursor-not-allowed bg-slate-50/60 opacity-45" : "cursor-pointer",
                isSelected && "bg-skyblue/10",
              )}
              title={isDisabled && disabledReason ? disabledReason : undefined}
            >
              <td
                className={joinClasses(
                  "sticky left-0 z-20 !w-14 !p-0 text-center shadow-[6px_0_12px_rgba(33,39,56,0.08)]",
                  isSelected ? "bg-skyblue/10" : "bg-white",
                  isDisabled && "!bg-slate-50",
                )}
              >
                <input
                  type={selectionMode === "single" ? "radio" : "checkbox"}
                  name={selectionMode === "single" ? `copy-from-${activeSource}-selection` : undefined}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onToggleRecord(original.id)}
                  className={joinClasses(
                    "h-4 w-4 border-darknavy/20 text-skyblue focus:ring-skyblue/35",
                    selectionMode === "single" ? "rounded-full" : "rounded",
                    isDisabled && "cursor-not-allowed opacity-50",
                  )}
                  aria-label={`Select ${original.sourceNo}`}
                />
              </td>
              <td className="font-semibold text-darknavy">
                <div className="flex items-center gap-2">
                  <span>{original.sourceNo}</span>
                  {isDisabled && disabledReason ? (
                    <span className="inline-flex items-center rounded border border-darknavy/10 bg-darknavy/5 px-1.5 py-0.5 text-[10px] font-medium text-darknavy/60">
                      {disabledReason}
                    </span>
                  ) : null}
                </div>
              </td>
              <td>{formatCopyFromDate(original.documentDate)}</td>
              <td>{formatCopyFromText(original.partyName)}</td>
              <td className="max-w-md text-darknavy/65">
                <span className="line-clamp-2">{formatCopyFromText(original.remarks)}</span>
              </td>
              <td className="text-right font-semibold tabular-nums text-darknavy">{formatCopyFromTableAmount(original.amount)}</td>
            </tr>
          );
        }}
        rootClassName="flex min-h-0 flex-1 flex-col rounded-none border-0 shadow-none"
        scrollContainerClassName="min-h-0 flex-1 overflow-auto"
        table={table}
        toolbar={<AppCopyFromFilters isRefreshing={isRefreshing} value={filters} onChange={onFiltersChange} onRefresh={refreshRecords} />}
        variant="embedded"
      />
    </ModuleResizableDialog>,
    document.body,
  );
}

function AppCopyFromDialogActions({ lastRefreshedAt }: { lastRefreshedAt: Date }) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/58 shadow-sm shadow-darknavy/5">
        <RefreshCw className="h-3.5 w-3.5 text-citron" aria-hidden="true" />
        Live
        <span className="font-medium text-darknavy/42">{formatCopyFromLiveTime(lastRefreshedAt)}</span>
      </div>
    </div>
  );
}

function AppCopyFromFooter({
  selectedCount,
  selectedTotalAmount,
  onApply,
}: {
  selectedCount: number;
  selectedTotalAmount: number;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-sm font-semibold text-darknavy/65">
        {selectedCount} selected
        <span className="mx-2 text-darknavy/25">|</span>
        Total Amount: <span className="text-darknavy">{formatCopyFromAmount(selectedTotalAmount)}</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onApply}
          className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export function AppCopyFromFilters({
  isRefreshing = false,
  value,
  onChange,
  onRefresh,
}: {
  isRefreshing?: boolean;
  value: AppCopyFromFiltersValue;
  onChange: (value: AppCopyFromFiltersValue) => void;
  onRefresh?: () => void;
}) {
  function updateField<TKey extends keyof AppCopyFromFiltersValue>(field: TKey, nextValue: AppCopyFromFiltersValue[TKey]) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <div className="grid gap-3 border-b border-darknavy/10 px-5 py-4 lg:grid-cols-[minmax(16rem,1fr)_minmax(18rem,22rem)_minmax(18rem,22rem)_auto]">
      <label className="relative min-w-0">
        <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">Search</span>
        <span className="flex h-12 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 shadow-sm shadow-darknavy/5 transition focus-within:border-skyblue/45 focus-within:ring-4 focus-within:ring-skyblue/15">
          <Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
          <input
            value={value.query}
            onChange={(event) => updateField("query", event.target.value)}
            placeholder="Search transaction"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-darknavy outline-none placeholder:text-darknavy/35"
          />
        </span>
      </label>
      <DateRangePicker
        label="Date Range"
        panelClassName="z-[150]"
        value={value.dateRange}
        onChange={(dateRange) => updateField("dateRange", dateRange)}
      />
      <AmountRangePicker
        label="Amount Range"
        panelClassName="z-[150]"
        value={value.amountRange}
        onChange={(amountRange) => updateField("amountRange", amountRange)}
      />
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-darknavy/65 shadow-sm shadow-darknavy/5 transition hover:border-skyblue/25 hover:bg-skyblue/8 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw className={joinClasses("h-4 w-4", isRefreshing && "animate-spin text-skyblue")} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function filterCopyFromRecords(records: AppCopyFromRecord[], filters: AppCopyFromFiltersValue) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const dateFrom = filters.dateRange.from;
  const dateTo = filters.dateRange.to;
  const amountFrom = parseOptionalCopyFromAmount(filters.amountRange.from) ?? 0;
  const amountTo = parseOptionalCopyFromAmount(filters.amountRange.to) ?? Number.MAX_SAFE_INTEGER;

  return records.filter((record) => {
    const amount = parseCopyFromAmount(record.amount);
    const documentDate = record.documentDate ?? "";
    const matchesQuery =
      !normalizedQuery ||
      [record.sourceNo, record.partyName, record.documentDate, record.amount, record.remarks]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesDateFrom = !dateFrom || documentDate >= dateFrom;
    const matchesDateTo = !dateTo || documentDate <= dateTo;
    const matchesAmountFrom = amount >= amountFrom;
    const matchesAmountTo = amount <= amountTo;

    return matchesQuery && matchesDateFrom && matchesDateTo && matchesAmountFrom && matchesAmountTo;
  });
}

function parseOptionalCopyFromAmount(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return parseCopyFromAmount(trimmedValue);
}

function parseCopyFromAmount(value: number | string | undefined) {
  return parseMoneyNumberInput(value);
}

function formatCopyFromAmount(value: number | string | undefined) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(parseCopyFromAmount(value));
}

function formatCopyFromLiveTime(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatCopyFromDate(value: string | undefined) {
  return formatCopyFromText(value);
}

function formatCopyFromText(value: string | undefined) {
  return value?.trim() ?? "";
}

function formatCopyFromTableAmount(value: number | string | undefined) {
  if (value === undefined || (typeof value === "string" && value.trim() === "")) {
    return "";
  }

  return formatCopyFromAmount(value);
}
