"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Copy,
  FileText,
  LayoutGrid,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  DisbursementVoucherInitialEntryDraft,
  createTaxDetails,
  formatCurrency,
  formatDateLabel,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { validateDisbursementVoucherEntries } from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  readAccountingGridSession,
  writeAccountingGridSession,
  type DisbursementVoucherAccountingGridSession,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/AccountingGridSession";

type EditableGridRow = {
  accountCode: string;
  accountName: string;
  credit: string;
  debit: string;
  id: string;
  particulars: string;
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
};

const TaxRateOptions = ["0%", "1%", "2%", "5%", "12%"];

export function DisbursementVoucherAccountingGridPage() {
  const router = useRouter();
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const pendingScrollRowIdRef = useRef<string | null>(null);
  const [session, setSession] =
    useState<DisbursementVoucherAccountingGridSession | null>(null);
  const [rows, setRows] = useState<EditableGridRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  useEffect(() => {
    const nextSession = readAccountingGridSession();
    const restoreTimer = window.setTimeout(() => {
      if (!nextSession) {
        setIsLoaded(true);
        return;
      }

      setSession(nextSession);
      setRows(createInitialRows(nextSession.values.lineEntries));
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!pendingScrollRowIdRef.current || rows.length === 0) {
      return;
    }

    const targetRowId = pendingScrollRowIdRef.current;
    pendingScrollRowIdRef.current = null;

    const scrollTimer = window.setTimeout(() => {
      const rowElement = document.querySelector<HTMLElement>(
        `[data-grid-row-id="${targetRowId}"]`,
      );
      const firstInput = document.querySelector<HTMLInputElement>(
        `[data-grid-row-input-id="${targetRowId}"]`,
      );

      rowElement?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      firstInput?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [rows]);

  const totals = useMemo(() => {
    const totalDebit = rows.reduce(
      (sum, row) => sum + normalizeAmount(row.debit),
      0,
    );
    const totalCredit = rows.reduce(
      (sum, row) => sum + normalizeAmount(row.credit),
      0,
    );

    return {
      isBalanced: totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001,
      totalCredit,
      totalDebit,
      variance: Math.abs(totalDebit - totalCredit),
    };
  }, [rows]);
  const previewEntries = useMemo(() => buildLineEntries(rows), [rows]);
  const selectedTransaction = useMemo(
    () =>
      session
        ? transactions.find(
            (transaction) => transaction.id === session.values.transactionId,
          )
        : undefined,
    [session, transactions],
  );

  function updateRow(
    rowId: string,
    field: keyof Omit<EditableGridRow, "id" | "taxDetails">,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextRow = {
          ...row,
          [field]: value,
        };

        if (field === "debit" || field === "credit" || field === "taxRate") {
          const amount = normalizeAmount(nextRow.debit || nextRow.credit);
          nextRow.taxDetails = syncTaxDetailsAmount(
            nextRow.taxDetails,
            amount,
            nextRow.taxRate,
          );
        }

        return nextRow;
      }),
    );
    setErrorMessage(null);
  }

  function keepRowInView(rowId: string) {
    const rowElement = document.querySelector<HTMLElement>(
      `[data-grid-row-id="${rowId}"]`,
    );

    rowElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  function addBlankRows(count = 1) {
    const nextRows = Array.from({ length: count }, () => createBlankEditableRow());
    pendingScrollRowIdRef.current = nextRows[nextRows.length - 1]?.id ?? null;
    setRows((currentRows) => [...currentRows, ...nextRows]);
  }

  function removeRow(rowId: string) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== rowId);
      return nextRows.length > 0 ? nextRows : [createBlankEditableRow()];
    });
  }

  function duplicateLastFilledRow() {
    const sourceRow = [...rows].reverse().find((row) => hasRowValue(row));

    if (!sourceRow) {
      addBlankRows();
      return;
    }

    const nextRow = {
      ...sourceRow,
      id: createGridRowId(),
    };
    pendingScrollRowIdRef.current = nextRow.id;
    setRows((currentRows) => [
      ...currentRows,
      nextRow,
    ]);
  }

  function clearAllRows() {
    setRows(Array.from({ length: 6 }, () => createBlankEditableRow()));
    setErrorMessage(null);
  }

  function handleBackToVoucher() {
    if (!session) {
      router.push("/cash-disbursement/disbursement-voucher");
      return;
    }

    writeAccountingGridSession({
      ...session,
      returnStep: "entries",
      values: {
        ...session.values,
        lineEntries: buildLineEntries(rows),
      },
    });
    router.push("/cash-disbursement/disbursement-voucher?grid=resume");
  }

  function handleSaveAndContinue() {
    if (!session) {
      return;
    }

    const nextValues = {
      ...session.values,
      lineEntries: previewEntries,
    };
    const nextErrors = validateDisbursementVoucherEntries(nextValues);

    if (nextErrors.lineEntries) {
      setErrorMessage(nextErrors.lineEntries);
      return;
    }

    setIsPreviewDialogOpen(true);
  }

  function handleContinueToVoucherPreview() {
    if (!session) {
      return;
    }

    const nextValues = {
      ...session.values,
      lineEntries: previewEntries,
    };

    writeAccountingGridSession({
      ...session,
      entryDraft: DisbursementVoucherInitialEntryDraft,
      returnStep: "review",
      values: nextValues,
    });
    router.push("/cash-disbursement/disbursement-voucher?grid=resume");
  }

  if (!isLoaded) {
    return null;
  }

  if (!session) {
    return (
      <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
        <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
          <div className="rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">
              Accounting Grid View
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/58">
              No voucher draft is available yet. Open a disbursement voucher
              first, then click Data Grid View from Accounting Entries.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push("/cash-disbursement/disbursement-voucher")
              }
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 sm:w-auto"
            >
              Back to Disbursement Voucher
            </button>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
      <div className="rounded-xl border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
              Cash Disbursement Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-darknavy sm:text-3xl">
              Accounting Grid View
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-darknavy/58">
              Encode accounting entries in a dedicated grid page, then save and
              return to the voucher preview for final checking before saving.
            </p>
          </div>
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-skyblue/20 bg-skyblue/8 px-4 py-2 text-sm font-semibold text-skyblue sm:w-auto sm:justify-start">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Data Grid Encoding
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Records" value={String(buildLineEntries(rows).length)} />
          <SummaryCard
            label="Debit Total"
            value={formatCurrency(totals.totalDebit)}
          />
          <SummaryCard
            label="Credit Total"
            value={formatCurrency(totals.totalCredit)}
          />
          <SummaryCard
            label="Status"
            tone={totals.isBalanced ? "balanced" : "warning"}
            value={totals.isBalanced ? "Balanced" : "Needs adjustment"}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <QuickActionButton
            icon={<CirclePlus className="h-4 w-4" aria-hidden="true" />}
            label="Add Row"
            onClick={() => addBlankRows()}
          />
          <QuickActionButton
            icon={<Copy className="h-4 w-4" aria-hidden="true" />}
            label="Duplicate Last Entry"
            onClick={duplicateLastFilledRow}
          />
          <QuickActionButton
            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            label="Add 5 Blank Rows"
            onClick={() => addBlankRows(5)}
          />
          <QuickActionButton
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            label="Clear All Lines"
            onClick={clearAllRows}
            tone="danger"
          />
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {rows.map((row, index) => (
            <section
              key={row.id}
              data-grid-row-id={row.id}
              className="rounded-xl border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-darknavy">
                  Row {index + 1}
                </p>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                  {row.taxRate || "0%"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <MobileGridField label="Account Code">
                  <input
                    data-grid-row-input-id={row.id}
                    value={row.accountCode}
                    onFocus={() => keepRowInView(row.id)}
                    onChange={(event) =>
                      updateRow(row.id, "accountCode", event.target.value)
                    }
                    className={GridInputClassName}
                    placeholder="Select or encode"
                  />
                </MobileGridField>
                <MobileGridField label="Account Name">
                  <input
                    value={row.accountName}
                    onFocus={() => keepRowInView(row.id)}
                    onChange={(event) =>
                      updateRow(row.id, "accountName", event.target.value)
                    }
                    className={GridInputClassName}
                    placeholder="Account name"
                  />
                </MobileGridField>
                <MobileGridField label="Particulars">
                  <input
                    value={row.particulars}
                    onFocus={() => keepRowInView(row.id)}
                    onChange={(event) =>
                      updateRow(row.id, "particulars", event.target.value)
                    }
                    className={GridInputClassName}
                    placeholder="Enter particulars"
                  />
                </MobileGridField>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MobileGridField label="Tax Rate">
                    <select
                      value={row.taxRate}
                      onFocus={() => keepRowInView(row.id)}
                      onChange={(event) =>
                        updateRow(row.id, "taxRate", event.target.value)
                      }
                      className={`${GridInputClassName} app-select-control`}
                    >
                      {TaxRateOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </MobileGridField>
                  <MobileGridField label="Debit">
                    <input
                      value={row.debit}
                      onFocus={() => keepRowInView(row.id)}
                      onChange={(event) =>
                        updateRow(row.id, "debit", event.target.value)
                      }
                      className={`${GridInputClassName} text-right`}
                      placeholder="0.00"
                    />
                  </MobileGridField>
                  <MobileGridField label="Credit">
                    <input
                      value={row.credit}
                      onFocus={() => keepRowInView(row.id)}
                      onChange={(event) =>
                        updateRow(row.id, "credit", event.target.value)
                      }
                      className={`${GridInputClassName} text-right`}
                      placeholder="0.00"
                    />
                  </MobileGridField>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <RowIconButton
                  label="Add row"
                  title="Add row"
                  tone="sky"
                  onClick={() => addBlankRows()}
                >
                  <CirclePlus className="h-4 w-4" aria-hidden="true" />
                </RowIconButton>
                <RowIconButton
                  label="Duplicate"
                  title="Duplicate row"
                  onClick={() => {
                    const nextRow = { ...row, id: createGridRowId() };
                    pendingScrollRowIdRef.current = nextRow.id;
                    setRows((currentRows) => [...currentRows, nextRow]);
                  }}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </RowIconButton>
                <RowIconButton
                  label="Remove"
                  title="Remove row"
                  tone="danger"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </RowIconButton>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-xl border border-darknavy/10 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="bg-offwhite/60 text-xs font-semibold uppercase tracking-[0.16em] text-darknavy/45">
                <tr>
                  <th className="w-14 px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3">Account Code</th>
                  <th className="px-3 py-3">Account Name</th>
                  <th className="px-3 py-3">Particulars</th>
                  <th className="px-3 py-3">Tax Rate</th>
                  <th className="px-3 py-3 text-right">Debit</th>
                  <th className="px-3 py-3 text-right">Credit</th>
                  <th className="w-36 px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    data-grid-row-id={row.id}
                    className="border-t border-darknavy/8 align-top transition hover:bg-skyblue/5"
                  >
                    <td className="px-3 py-3 text-center text-sm font-semibold text-darknavy/60">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        data-grid-row-input-id={row.id}
                        value={row.accountCode}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "accountCode", event.target.value)
                        }
                        className={GridInputClassName}
                        placeholder="Select or encode"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.accountName}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "accountName", event.target.value)
                        }
                        className={GridInputClassName}
                        placeholder="Account name"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.particulars}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "particulars", event.target.value)
                        }
                        className={GridInputClassName}
                        placeholder="Enter particulars"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.taxRate}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "taxRate", event.target.value)
                        }
                        className={`${GridInputClassName} app-select-control`}
                      >
                        {TaxRateOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.debit}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "debit", event.target.value)
                        }
                        className={`${GridInputClassName} text-right`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.credit}
                        onFocus={() => keepRowInView(row.id)}
                        onChange={(event) =>
                          updateRow(row.id, "credit", event.target.value)
                        }
                        className={`${GridInputClassName} text-right`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => addBlankRows()}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-skyblue/20 bg-skyblue/10 text-skyblue transition hover:bg-skyblue/16"
                          title="Add row"
                        >
                          <CirclePlus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextRow = { ...row, id: createGridRowId() };
                            pendingScrollRowIdRef.current = nextRow.id;
                            setRows((currentRows) => [...currentRows, nextRow]);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-darknavy/70 transition hover:border-skyblue/35 hover:bg-skyblue/8 hover:text-darknavy"
                        >
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-coralpink/12 text-coralpink transition hover:bg-coralpink/18"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-darknavy/10 bg-offwhite/45 p-4 sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/45">
              Quick Encoding Tips
            </p>
            <div className="mt-4 grid gap-3 text-sm text-darknavy/62">
              <p>Encode one journal line per row for easier balancing.</p>
              <p>Enter the amount in debit or credit only for each line.</p>
              <p>
                Leave extra blank rows if you are still preparing the next line.
                Blank rows will not be saved.
              </p>
              <p>
                After Save & Preview, the flow returns to the voucher preview
                so you can still review everything before final save.
              </p>
            </div>
            {errorMessage ? (
              <p className="mt-4 text-sm font-medium text-coralpink">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-darknavy/10 bg-white p-4 sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/45">
              Balance Summary
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Total Debit"
                value={formatCurrency(totals.totalDebit)}
              />
              <SummaryCard
                label="Total Credit"
                value={formatCurrency(totals.totalCredit)}
              />
              <SummaryCard
                label="Variance"
                tone={totals.isBalanced ? "balanced" : "warning"}
                value={formatCurrency(totals.variance)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleBackToVoucher}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 sm:w-auto"
          >
            Back to Voucher
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 sm:w-auto"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save & Preview
          </button>
        </div>
      </div>
      </main>

      <GridPreviewDialog
        entries={previewEntries}
        isBalanced={totals.isBalanced}
        isOpen={isPreviewDialogOpen}
        selectedTransaction={selectedTransaction}
        totalCredit={totals.totalCredit}
        totalDebit={totals.totalDebit}
        values={session.values}
        variance={totals.variance}
        onClose={() => setIsPreviewDialogOpen(false)}
        onContinue={handleContinueToVoucherPreview}
      />
    </section>
  );
}

function GridPreviewDialog({
  entries,
  isBalanced,
  isOpen,
  selectedTransaction,
  totalCredit,
  totalDebit,
  values,
  variance,
  onClose,
  onContinue,
}: {
  entries: DisbursementLineEntry[];
  isBalanced: boolean;
  isOpen: boolean;
  selectedTransaction?: DisbursementTransactionRecord;
  totalCredit: number;
  totalDebit: number;
  values: DisbursementVoucherFormValues;
  variance: number;
  onClose: () => void;
  onContinue: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="grid-preview-title"
        className="flex h-[min(100dvh-0.75rem,980px)] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)] sm:h-[min(86vh,980px)] sm:rounded-[28px]"
      >
        <div className="border-b border-darknavy/10 px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
            Edit Disbursement Voucher
          </p>
          <h2
            id="grid-preview-title"
            className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl"
          >
            {values.voucherNo}
          </h2>
          <p className="mt-2 text-sm text-darknavy/58">
            Review the voucher details and accounting entries from grid view
            before continuing to the final save step.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5">
          <div className="grid items-stretch gap-5 xl:grid-cols-2">
            <PreviewShell
              description="This panel shows the source transaction that the voucher workflow will use."
              eyebrow="Transaction Preview"
              title={
                selectedTransaction?.payee ??
                (values.vceName || "Voucher Preview")
              }
            >
              <div className="grid gap-5">
                <PreviewInfoLine
                  label="Transaction No."
                  value={selectedTransaction?.transactionNo ?? "-"}
                />
                <PreviewInfoLine
                  label="Department"
                  value={selectedTransaction?.department ?? "-"}
                />
                <PreviewInfoLine
                  label="Requested By"
                  value={selectedTransaction?.requestedBy ?? "-"}
                />
                <PreviewInfoLine
                  label="Amount"
                  value={formatCurrency(Number(values.amount || 0))}
                />
                <PreviewInfoLine
                  label="Purpose"
                  value={selectedTransaction?.purpose ?? (values.remarks || "-")}
                />
              </div>
            </PreviewShell>

            <PreviewShell
              description="A linked voucher exists for this transaction and can be reviewed or edited."
              eyebrow="Voucher Status"
              title={values.voucherNo}
            >
              <div className="grid gap-5">
                <PreviewInfoLine
                  label="Voucher Date"
                  value={formatDateLabel(values.voucherDate)}
                />
                <PreviewInfoLine
                  label="Payment Method"
                  value={values.paymentMethod || "-"}
                />
                <PreviewInfoLine
                  label="Prepared By"
                  value={values.preparedBy || "-"}
                />
                <PreviewInfoLine label="Status" value={values.status || "-"} />
                <PreviewInfoLine label="Remarks" value={values.remarks || "-"} />

                <div className="rounded-[18px] bg-coralpink px-4 py-4 text-darknavy shadow-[0_16px_36px_rgba(249,112,104,0.18)] sm:px-5 sm:py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-darknavy/72">
                    Linked Voucher Amount
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatCurrency(Number(values.amount || 0))}
                  </p>
                </div>
              </div>
            </PreviewShell>
          </div>

          <PreviewShell
            description="Confirm the journal lines, totals, and attachments before the final save."
            eyebrow="Accounting Preview"
            title="Accounting entries review"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-darknavy/58">
                {entries.length} accounting entries prepared.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
              >
                Edit Entries
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[18px] border border-darknavy/8 bg-offwhite/65 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-darknavy">
                        {entry.accountCode} - {entry.accountName}
                      </p>
                      <p className="mt-1 text-sm text-darknavy/58">
                        {entry.particulars}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
                        {entry.taxRate || "0%"}
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-darknavy">
                      <p>
                        {entry.debit > 0
                          ? `DR ${formatCurrency(entry.debit)}`
                          : "-"}
                      </p>
                      <p className="mt-1">
                        {entry.credit > 0
                          ? `CR ${formatCurrency(entry.credit)}`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Total Debit"
                value={formatCurrency(totalDebit)}
              />
              <SummaryCard
                label="Total Credit"
                value={formatCurrency(totalCredit)}
              />
              <SummaryCard
                label="Variance"
                tone={isBalanced ? "balanced" : "warning"}
                value={formatCurrency(variance)}
              />
            </div>

            <div className="mt-5 rounded-[18px] border border-darknavy/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
                Attachments
              </p>
              <div className="mt-3 grid gap-3">
                {values.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-2 rounded-xl border border-darknavy/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium text-darknavy">
                        {attachment.name}
                      </span>
                    </div>
                    <span className="text-xs text-darknavy/50">
                      {attachment.sizeLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PreviewShell>
        </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8 sm:w-auto"
          >
            Back to Grid
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 sm:w-auto"
          >
            Continue to Voucher Preview
          </button>
        </div>
      </section>
    </div>
  );
}

function PreviewShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}

function MobileGridField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/42">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewInfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/38">
        {label}
      </dt>
      <dd className="text-sm font-medium text-darknavy">{value}</dd>
    </div>
  );
}

function RowIconButton({
  children,
  label,
  onClick,
  title,
  tone = "default",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  title: string;
  tone?: "danger" | "default" | "sky";
}) {
  const className =
    tone === "danger"
      ? "border-coralpink/18 bg-coralpink/10 text-coralpink hover:bg-coralpink/16"
      : tone === "sky"
        ? "border-skyblue/20 bg-skyblue/10 text-skyblue hover:bg-skyblue/16"
        : "border-darknavy/10 bg-white text-darknavy/70 hover:border-skyblue/35 hover:bg-skyblue/8 hover:text-darknavy";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${className}`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function SummaryCard({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "balanced" | "default" | "warning";
  value: string;
}) {
  return (
    <div
      className={`rounded-[18px] border px-4 py-4 ${
        tone === "balanced"
          ? "border-citron/35 bg-citron/15"
          : tone === "warning"
            ? "border-coralpink/18 bg-coralpink/8"
            : "border-darknavy/10 bg-offwhite/35"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/45">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-darknavy">{value}</p>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "danger" | "default";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition sm:w-auto ${
        tone === "danger"
          ? "border-coralpink/18 bg-coralpink/8 text-coralpink hover:bg-coralpink/14"
          : "border-darknavy/12 bg-white text-darknavy hover:border-skyblue/35 hover:bg-skyblue/8"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function createInitialRows(entries: DisbursementLineEntry[]) {
  const mappedRows = entries.map(mapEntryToEditableRow);

  if (mappedRows.length >= 6) {
    return mappedRows;
  }

  return [
    ...mappedRows,
    ...Array.from({ length: 6 - mappedRows.length }, () =>
      createBlankEditableRow(),
    ),
  ];
}

function mapEntryToEditableRow(entry: DisbursementLineEntry): EditableGridRow {
  return {
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    credit: entry.credit > 0 ? entry.credit.toFixed(2) : "",
    debit: entry.debit > 0 ? entry.debit.toFixed(2) : "",
    id: entry.id,
    particulars: entry.particulars,
    taxDetails: entry.taxDetails,
    taxRate: entry.taxRate || "0%",
  };
}

function createBlankEditableRow(): EditableGridRow {
  return {
    accountCode: "",
    accountName: "",
    credit: "",
    debit: "",
    id: createGridRowId(),
    particulars: "",
    taxDetails: createTaxDetails(0, "0%"),
    taxRate: "0%",
  };
}

function createGridRowId() {
  return `grid-${Math.random().toString(36).slice(2, 10)}`;
}

function hasRowValue(row: EditableGridRow) {
  return Boolean(
    row.accountCode.trim() ||
      row.accountName.trim() ||
      row.particulars.trim() ||
      normalizeAmount(row.debit) > 0 ||
      normalizeAmount(row.credit) > 0,
  );
}

function normalizeAmount(value: string) {
  return Number(value || 0) || 0;
}

function buildLineEntries(rows: EditableGridRow[]): DisbursementLineEntry[] {
  return rows
    .filter(hasRowValue)
    .map((row) => {
      const debit = normalizeAmount(row.debit);
      const credit = normalizeAmount(row.credit);
      const amount = debit || credit;

      return {
        accountCode: row.accountCode.trim(),
        accountName: row.accountName.trim(),
        credit,
        debit,
        id: row.id,
        particulars: row.particulars.trim(),
        status: "Pending",
        taxDetails: syncTaxDetailsAmount(row.taxDetails, amount, row.taxRate),
        taxRate: row.taxRate || "0%",
      };
    });
}

const GridInputClassName =
  "app-theme-field h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-skyblue/45";
