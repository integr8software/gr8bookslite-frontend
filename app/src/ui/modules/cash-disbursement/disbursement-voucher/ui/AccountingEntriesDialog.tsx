"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { CirclePlus, LayoutGrid, Trash2, X } from "lucide-react";
import {
  createTaxDetails,
  formatCurrency,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type AccountingEntriesDialogProps = {
  isOpen: boolean;
  entryDraft: DisbursementVoucherEntryDraft;
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isBalanced: boolean;
  totalCredit: number;
  totalDebit: number;
  onAddEntry: () => void;
  onApplyAutoEntries: () => void;
  onBack: () => void;
  onClose: () => void;
  onDraftChange: (draft: DisbursementVoucherEntryDraft) => void;
  onOpenGridView: () => void;
  onProceed: () => void;
  onRemoveEntry: (entryId: string) => void;
  onUpdateEntryTax: (
    entryId: string,
    taxRate: string,
    taxDetails: DisbursementTaxDetails,
  ) => void;
};

export function AccountingEntriesDialog({
  isOpen,
  entryDraft,
  entries,
  errors,
  isBalanced,
  totalCredit,
  totalDebit,
  onAddEntry,
  onApplyAutoEntries,
  onBack,
  onClose,
  onDraftChange,
  onOpenGridView,
  onProceed,
  onRemoveEntry,
  onUpdateEntryTax,
}: AccountingEntriesDialogProps) {
  const accentPrimaryButtonClassName =
    "theme-accent-contrast-text inline-flex items-center justify-center rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85";
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [taxTargetEntryId, setTaxTargetEntryId] = useState<string | null>(null);
  const [taxRateDraft, setTaxRateDraft] = useState(entryDraft.taxRate);
  const [taxDraft, setTaxDraft] = useState(entryDraft.taxDetails);
  const [entryPagination, setEntryPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [entrySorting, setEntrySorting] = useState<SortingState>([
    { id: "accountCode", desc: false },
  ]);

  const entryColumns = useMemo<ColumnDef<DisbursementLineEntry>[]>(
    () => [
      {
        id: "accountCode",
        accessorFn: (row) => row.accountCode,
        header: "Account Code",
        sortingFn: "alphanumeric",
        meta: { className: "w-[10rem]" },
      },
      {
        id: "accountName",
        accessorFn: (row) => row.accountName,
        header: "Account Name",
        sortingFn: "alphanumeric",
        meta: { className: "w-[14rem]" },
      },
      {
        id: "particulars",
        accessorFn: (row) => row.particulars,
        header: "Particulars",
        sortingFn: "alphanumeric",
        meta: { className: "w-[20rem]" },
      },
      {
        id: "taxRate",
        accessorFn: (row) => row.taxRate || "0%",
        header: "Tax Rate",
        sortingFn: "alphanumeric",
        meta: { className: "w-[8rem]" },
      },
      {
        id: "debit",
        accessorFn: (row) => row.debit,
        header: "Debit",
        sortingFn: "basic",
        meta: { className: "w-[9rem] text-right" },
      },
      {
        id: "credit",
        accessorFn: (row) => row.credit,
        header: "Credit",
        sortingFn: "basic",
        meta: { className: "w-[9rem] text-right" },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[10rem] text-right" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const entryTable = useReactTable({
    data: entries,
    columns: entryColumns,
    state: {
      pagination: entryPagination,
      sorting: entrySorting,
    },
    onPaginationChange: setEntryPagination,
    onSortingChange: setEntrySorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!isOpen) {
    return null;
  }

  function getEntryAmount() {
    return Number(entryDraft.debit || 0) || Number(entryDraft.credit || 0);
  }

  function updateDraftField(
    field: keyof Omit<DisbursementVoucherEntryDraft, "taxRate" | "taxDetails">,
    value: string,
  ) {
    onDraftChange({
      ...entryDraft,
      [field]: value,
    });
  }

  function openTaxDialog() {
    const amount = getEntryAmount();
    setTaxTargetEntryId(null);
    setTaxRateDraft(entryDraft.taxRate || "0%");
    setTaxDraft(
      syncTaxDetailsAmount(entryDraft.taxDetails, amount, entryDraft.taxRate),
    );
    setIsTaxDialogOpen(true);
  }

  function openEntryTaxDialog(entry: DisbursementLineEntry) {
    const amount = entry.debit || entry.credit || 0;
    setTaxTargetEntryId(entry.id);
    setTaxRateDraft(entry.taxRate || "0%");
    setTaxDraft(syncTaxDetailsAmount(entry.taxDetails, amount, entry.taxRate));
    setIsTaxDialogOpen(true);
  }

  function applyTaxRate(
    nextTaxRate: string,
    nextTaxDetails?: DisbursementTaxDetails,
  ) {
    const matchedEntry = taxTargetEntryId
      ? entries.find((entry) => entry.id === taxTargetEntryId)
      : undefined;
    const baseAmount = matchedEntry
      ? matchedEntry.debit || matchedEntry.credit || 0
      : getEntryAmount();
    const computedTaxDetails =
      nextTaxDetails ?? createTaxDetails(baseAmount, nextTaxRate);

    setTaxRateDraft(nextTaxRate);
    setTaxDraft({
      ...taxDraft,
      ...computedTaxDetails,
      grossAmount: baseAmount,
    });
  }

  function handleTaxSave() {
    if (taxTargetEntryId) {
      const matchedEntry = entries.find(
        (entry) => entry.id === taxTargetEntryId,
      );

      if (matchedEntry) {
        const amount = matchedEntry.debit || matchedEntry.credit || 0;
        const syncedTaxDetails = syncTaxDetailsAmount(
          taxDraft,
          amount,
          taxRateDraft,
        );

        onUpdateEntryTax(taxTargetEntryId, taxRateDraft, syncedTaxDetails);
      }
    } else {
      const amount = getEntryAmount();
      const syncedTaxDetails = syncTaxDetailsAmount(
        taxDraft,
        amount,
        taxRateDraft,
      );

      onDraftChange({
        ...entryDraft,
        taxRate: taxRateDraft,
        taxDetails: syncedTaxDetails,
      });
    }

    setIsTaxDialogOpen(false);
    setTaxTargetEntryId(null);
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="accounting-entries-dialog-title"
        className="flex h-[min(78vh,760px)] w-full max-w-[1320px] flex-col overflow-hidden rounded-2xl border border-darknavy/10 bg-white shadow-[0_16px_48px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h2
              id="accounting-entries-dialog-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              Accounting Entries
            </h2>
            <p className="mt-1 text-sm text-darknavy/55">
              Review, add, and balance the journal lines before moving to
              preview.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          <div className="border border-darknavy/10 bg-white">
            <div className="border-b border-darknavy/8 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                    Accounting Entries
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-darknavy">
                    Complete journal lines
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onApplyAutoEntries}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
                >
                  <CirclePlus className="h-4 w-4" aria-hidden="true" />
                  Auto Entries
                </button>
                <button
                  type="button"
                  onClick={onOpenGridView}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-skyblue/20 bg-skyblue/8 px-4 text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  Data Grid View
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 px-4 py-3 text-sm text-darknavy/70">
                  Records:{" "}
                  <span className="font-semibold text-darknavy">
                    {entries.length}
                  </span>
                </div>
                <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 px-4 py-3 text-sm text-darknavy/70">
                  Debit:{" "}
                  <span className="font-semibold text-darknavy">
                    {formatCurrency(totalDebit)}
                  </span>
                </div>
                <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 px-4 py-3 text-sm text-darknavy/70">
                  Credit:{" "}
                  <span className="font-semibold text-darknavy">
                    {formatCurrency(totalCredit)}
                  </span>
                </div>
                <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 px-4 py-3 text-sm text-darknavy/70">
                  Variance:{" "}
                  <span className="font-semibold text-darknavy">
                    {formatCurrency(Math.abs(totalDebit - totalCredit))}
                  </span>
                </div>
                <div
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                    isBalanced
                      ? "border-citron/40 bg-citron/20 text-darknavy"
                      : "border-coralpink/20 bg-coralpink/10 text-coralpink"
                  }`}
                >
                  {isBalanced ? "Balanced" : "Needs adjustment"}
                </div>
              </div>

              <div className="border border-darknavy/10 bg-white p-4">
                <div className="grid gap-4 xl:grid-cols-[1.15fr_1.15fr_0.85fr]">
                  <DialogFieldShell label="Account Code">
                    <input
                      value={entryDraft.accountCode}
                      onChange={(event) =>
                        updateDraftField("accountCode", event.target.value)
                      }
                      className={EntryFieldClassName}
                      placeholder="e.g. 5010-001"
                    />
                  </DialogFieldShell>
                  <DialogFieldShell label="Account Name">
                    <input
                      value={entryDraft.accountName}
                      onChange={(event) =>
                        updateDraftField("accountName", event.target.value)
                      }
                      className={EntryFieldClassName}
                      placeholder="Office Supplies Expense"
                    />
                  </DialogFieldShell>
                  <DialogFieldShell label="Particulars">
                    <input
                      value={entryDraft.particulars}
                      onChange={(event) =>
                        updateDraftField("particulars", event.target.value)
                      }
                      className={EntryFieldClassName}
                      placeholder="Describe the accounting line"
                    />
                  </DialogFieldShell>
                  <DialogFieldShell label="Tax">
                    <button
                      type="button"
                      onClick={openTaxDialog}
                      className={`${EntryFieldClassName} flex items-center justify-between text-left`}
                    >
                      <span className="text-darknavy">
                        {entryDraft.taxRate || "0%"}
                      </span>
                      <span className="text-xs font-semibold text-skyblue">
                        Configure
                      </span>
                    </button>
                  </DialogFieldShell>
                  <div className="grid gap-4 sm:grid-cols-2 xl:col-span-1">
                    <DialogFieldShell label="Debit">
                      <input
                        value={entryDraft.debit}
                        onChange={(event) =>
                          updateDraftField("debit", event.target.value)
                        }
                        className={`${EntryFieldClassName} text-right`}
                        placeholder="0.00"
                      />
                    </DialogFieldShell>
                    <DialogFieldShell label="Credit">
                      <input
                        value={entryDraft.credit}
                        onChange={(event) =>
                          updateDraftField("credit", event.target.value)
                        }
                        className={`${EntryFieldClassName} text-right`}
                        placeholder="0.00"
                      />
                    </DialogFieldShell>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    {errors.entryDraft ? (
                      <p className="text-sm font-medium text-coralpink">
                        {errors.entryDraft}
                      </p>
                    ) : (
                      <p className="text-sm text-darknavy/55">
                        Add the journal lines manually or open Data Grid View
                        for spreadsheet-style encoding.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onAddEntry}
                      className={`${accentPrimaryButtonClassName} h-11 min-w-32`}
                    >
                      Add Line
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:hidden">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-darknavy/10 bg-white p-4"
                    >
                      <p className="text-base font-semibold text-darknavy">
                        {entry.accountCode}
                      </p>
                      <p className="mt-1 text-sm text-darknavy/72">
                        {entry.accountName}
                      </p>
                      <p className="mt-3 text-sm text-darknavy/58">
                        {entry.particulars}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="border border-darknavy/10 bg-offwhite/40 px-3 py-3 sm:col-span-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                            Tax Rate
                          </p>
                          <p className="mt-2 text-sm font-semibold text-darknavy">
                            <button
                              type="button"
                              onClick={() => openEntryTaxDialog(entry)}
                              className="text-sm font-semibold text-skyblue transition hover:text-skyblue/80"
                            >
                              {entry.taxRate || "0%"}
                            </button>
                          </p>
                        </div>
                        <div className="border border-darknavy/10 bg-offwhite/40 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                            Debit
                          </p>
                          <p className="mt-2 text-sm font-semibold text-darknavy">
                            {entry.debit > 0
                              ? formatCurrency(entry.debit)
                              : "-"}
                          </p>
                        </div>
                        <div className="border border-darknavy/10 bg-offwhite/40 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                            Credit
                          </p>
                          <p className="mt-2 text-sm font-semibold text-darknavy">
                            {entry.credit > 0
                              ? formatCurrency(entry.credit)
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => onRemoveEntry(entry.id)}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-coralpink/12 px-3 text-xs font-semibold text-coralpink transition hover:bg-coralpink/18"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-darknavy/12 bg-offwhite/40 px-4 py-12 text-center text-sm text-darknavy/55">
                    No accounting entries yet. Add a journal line or use auto
                    entries.
                  </div>
                )}
              </div>

              <div className="hidden md:block">
                <ModuleTable
                  variant="embedded"
                  emptyDescription="Add a journal line manually or use auto entries."
                  emptyTitle="No accounting entries yet"
                  maxHeightClassName="max-h-[320px]"
                  minWidthClassName="min-w-[820px]"
                  paginationLabel="entries"
                  paginationStorageKey="disbursement-voucher-accounting-entries"
                  pageSizeOptions={[5, 10, 15]}
                  table={entryTable}
                  renderRow={({ id, original }) => (
                    <tr key={id} className="transition hover:bg-skyblue/5">
                      <td className="px-5 py-4 text-sm font-semibold text-darknavy">
                        {original.accountCode}
                      </td>
                      <td className="px-5 py-4 text-sm text-darknavy/72">
                        {original.accountName}
                      </td>
                      <td className="px-5 py-4 text-sm text-darknavy/72">
                        {original.particulars}
                      </td>
                      <td className="px-5 py-4 text-sm text-darknavy/72">
                        <button
                          type="button"
                          onClick={() => openEntryTaxDialog(original)}
                          className="font-semibold text-skyblue transition hover:text-skyblue/80"
                        >
                          {original.taxRate || "0%"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-darknavy/72">
                        {original.debit > 0
                          ? formatCurrency(original.debit)
                          : "-"}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-darknavy/72">
                        {original.credit > 0
                          ? formatCurrency(original.credit)
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onRemoveEntry(original.id)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-coralpink/12 px-3 text-xs font-semibold text-coralpink transition hover:bg-coralpink/18"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>

              {errors.lineEntries ? (
                <p className="text-sm font-medium text-coralpink">
                  {errors.lineEntries}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 sm:w-auto"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onProceed}
                className={`${accentPrimaryButtonClassName} h-11 w-full sm:w-auto`}
              >
                Proceed to Preview
              </button>
            </div>
          </div>
        </div>
      </section>

      <TaxDetailsDialog
        isOpen={isTaxDialogOpen}
        taxDetails={taxDraft}
        taxRate={taxRateDraft}
        onClose={() => setIsTaxDialogOpen(false)}
        onSave={handleTaxSave}
        onTaxDetailsChange={setTaxDraft}
        onTaxRateChange={applyTaxRate}
      />
    </div>
  );
}

function TaxDetailsDialog({
  isOpen,
  taxDetails,
  taxRate,
  onClose,
  onSave,
  onTaxDetailsChange,
  onTaxRateChange,
}: {
  isOpen: boolean;
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
  onClose: () => void;
  onSave: () => void;
  onTaxDetailsChange: (value: DisbursementTaxDetails) => void;
  onTaxRateChange: (
    value: string,
    nextTaxDetails?: DisbursementTaxDetails,
  ) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tax-details-dialog-title"
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_16px_48px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-3">
          <h3
            id="tax-details-dialog-title"
            className="text-2xl font-medium text-darknavy"
          >
            Tax
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-darknavy/60 transition hover:bg-darknavy/5"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4">
          <TaxDialogRow label="Gross Amount :">
            <input
              value={taxDetails.grossAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="Net Amount :">
            <input
              value={taxDetails.netAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="VAT Code :">
            <select
              value={taxRate}
              onChange={(event) => {
                const nextTaxRate = event.target.value;
                const nextTaxDetails = createTaxDetails(
                  taxDetails.grossAmount,
                  nextTaxRate,
                );
                onTaxRateChange(nextTaxRate, {
                  ...taxDetails,
                  ...nextTaxDetails,
                });
              }}
              className={FieldClassName}
            >
              <option value="0%">--Select VAT Rate--</option>
              <option value="1%">VAT 1%</option>
              <option value="2%">VAT 2%</option>
              <option value="5%">VAT 5%</option>
              <option value="10%">VAT 10%</option>
              <option value="12%">VAT 12%</option>
            </select>
          </TaxDialogRow>

          <TaxDialogRow label="Percent :">
            <input
              value={formatPercentField(taxDetails.vatPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="VAT Amount :">
            <input
              value={taxDetails.vatAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="EWT Code :">
            <select
              value={taxDetails.ewtCode}
              onChange={(event) => {
                const nextEwtCode = event.target.value;
                const nextEwtPercent = getEwtPercentFromCode(nextEwtCode);
                const ewtAmount = roundTaxAmount(
                  (taxDetails.grossAmount * nextEwtPercent) / 100,
                );
                const nextTaxDetails = {
                  ...taxDetails,
                  ewtCode: nextEwtCode,
                  ewtPercent: nextEwtPercent,
                  ewtAmount,
                  netAmount: roundTaxAmount(taxDetails.grossAmount - ewtAmount),
                  amount: roundTaxAmount(taxDetails.grossAmount - ewtAmount),
                };

                onTaxDetailsChange(nextTaxDetails);
              }}
              className={FieldClassName}
            >
              <option value="">--Select EWT Code--</option>
              <option value="EWT-1">EWT-1</option>
              <option value="EWT-2">EWT-2</option>
              <option value="EWT-5">EWT-5</option>
            </select>
          </TaxDialogRow>

          <TaxDialogRow label="Percent :">
            <input
              value={formatPercentField(taxDetails.ewtPercent)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="EWT Amount :">
            <input
              value={taxDetails.ewtAmount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>

          <TaxDialogRow label="Amount :">
            <input
              value={taxDetails.amount.toFixed(2)}
              readOnly
              className={`${ReadOnlyFieldClassName} text-right`}
            />
          </TaxDialogRow>
        </div>

        <div className="border-t border-darknavy/10 px-4 py-3">
          <button
            type="button"
            onClick={onSave}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center rounded bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

function TaxDialogRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[7.5rem_1fr]">
      <label className="text-sm text-darknavy/82">{label}</label>
      {children}
    </div>
  );
}

function DialogFieldShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-darknavy/68">
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatPercentField(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function getEwtPercentFromCode(code: string) {
  if (code === "EWT-1") {
    return 1;
  }

  if (code === "EWT-2") {
    return 2;
  }

  if (code === "EWT-5") {
    return 5;
  }

  return 0;
}

function roundTaxAmount(value: number) {
  return Math.round(value * 100) / 100;
}

const FieldClassName =
  "h-11 rounded border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45";

const ReadOnlyFieldClassName =
  "h-11 rounded border border-darknavy/12 bg-offwhite/55 px-3 text-sm text-darknavy/70 outline-none";

const EntryFieldClassName =
  "h-10 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45";
