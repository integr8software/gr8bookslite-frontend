"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  CirclePlus,
  FileText,
  Paperclip,
  Percent,
  X,
} from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  createTaxDetails,
  createAutoDisbursementLineEntries,
  createDisbursementVoucherFormValues,
  createDisbursementVoucherFromForm,
  formatTaxRateSummary,
  formatCurrency,
  formatDateLabel,
  syncTaxDetailsAmount,
  updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  DisbursementVoucherPreviewRow,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherActionHeader";
import { DisbursementVoucherDrawer } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherDrawer";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherNotFound";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
} from "@/app/src/ui/shared/module/data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherAction() {
  return (
    <Suspense fallback={<VoucherWorkflowSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

type TaxEditorTarget =
  { kind: "entry"; entryId: string }
  | null;

type DrawerState = {
  mode: "add" | "edit";
  row?: DisbursementVoucherPreviewRow;
} | null;

function DisbursementVoucherActionInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const mode = getActionMode(pathname);
  const transactions = useDisbursementVoucherStore(
    (state) => state.transactions,
  );
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const addVoucher = useDisbursementVoucherStore((state) => state.addVoucher);
  const updateVoucher = useDisbursementVoucherStore(
    (state) => state.updateVoucher,
  );
  const deleteVoucher = useDisbursementVoucherStore(
    (state) => state.deleteVoucher,
  );
  const isMutating = useDisbursementVoucherStore((state) => state.isMutating);
  const initialTransactionId =
    mode === "add"
      ? (searchParams.get("transactionId") ?? "")
      : (params.recordId ?? "");
  const selectedTransactionId = initialTransactionId;
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId,
  );
  const existingVoucher = vouchers.find(
    (voucher) => voucher.transactionId === selectedTransactionId,
  );
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createDisbursementVoucherFormValues(selectedTransaction, existingVoucher),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [step, setStep] = useState<WorkflowStep>("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taxEditorTarget, setTaxEditorTarget] = useState<TaxEditorTarget>(null);
  const [taxEditorValues, setTaxEditorValues] =
    useState<DisbursementTaxDetails | null>(null);
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const isReadonly = mode === "view";
  const totalDebit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0),
    [values.lineEntries],
  );
  const totalCredit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0),
    [values.lineEntries],
  );
  const isBalanced =
    values.lineEntries.length > 1 && Math.abs(totalDebit - totalCredit) < 0.001;

  if (!selectedTransaction && mode !== "add") {
    return <DisbursementVoucherNotFound />;
  }

  if (mode === "edit" && !existingVoucher) {
    return <DisbursementVoucherNotFound />;
  }

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleProceedFromEntries() {
    const nextErrors = validateDisbursementVoucherEntries(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStep("review");
  }

  function handleRemoveEntry(entryId: string) {
    updateField(
      "lineEntries",
      values.lineEntries.filter((entry) => entry.id !== entryId),
    );
  }

  function createBlankEntry(): DisbursementLineEntry {
    return {
      accountCode: "",
      accountName: "",
      credit: 0,
      debit: 0,
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      particulars: "",
      status: "Pending",
      taxDetails: createTaxDetails(0, "0%"),
      taxRate: "0%",
    };
  }

  function handleAddEntries(count = 1) {
    updateField("lineEntries", [
      ...values.lineEntries,
      ...Array.from({ length: count }, createBlankEntry),
    ]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleUpdateEntry(
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) {
    updateField(
      "lineEntries",
      values.lineEntries.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }

        const nextEntry = { ...entry, [field]: value };

        if (field === "debit" || field === "credit" || field === "taxRate") {
          const amount = Number(nextEntry.debit || 0) || Number(nextEntry.credit || 0);

          nextEntry.taxDetails = syncTaxDetailsAmount(
            nextEntry.taxDetails,
            amount,
            String(nextEntry.taxRate || "0%"),
          );
        }

        return nextEntry;
      }),
    );
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    const rowIndex = values.lineEntries.findIndex((entry) => entry.id === entryId);
    const insertIndex =
      rowIndex === -1
        ? values.lineEntries.length
        : rowIndex + (position === "below" ? 1 : 0);
    const nextEntries = [...values.lineEntries];

    nextEntries.splice(insertIndex, 0, createBlankEntry());
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    const rowIndex = values.lineEntries.findIndex((entry) => entry.id === entryId);
    const sourceEntry = values.lineEntries[rowIndex];

    if (!sourceEntry) {
      return;
    }

    const nextEntries = [...values.lineEntries];

    nextEntries.splice(rowIndex + 1, 0, {
      ...sourceEntry,
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    if (fromEntryId === toEntryId) {
      return;
    }

    const fromIndex = values.lineEntries.findIndex(
      (entry) => entry.id === fromEntryId,
    );
    const toIndex = values.lineEntries.findIndex((entry) => entry.id === toEntryId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const nextEntries = [...values.lineEntries];
    const [movedEntry] = nextEntries.splice(fromIndex, 1);

    nextEntries.splice(toIndex, 0, movedEntry);
    updateField("lineEntries", nextEntries);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    const nextEntries =
      action === "all"
        ? []
        : values.lineEntries.filter((entry) => !shouldClearEntry(entry, action));

    updateField("lineEntries", nextEntries.length > 0 ? nextEntries : [createBlankEntry()]);
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleApplyAutoEntries() {
    if (!selectedTransaction) {
      return;
    }

    updateField(
      "lineEntries",
      createAutoDisbursementLineEntries(selectedTransaction),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleOpenEntryTaxEditor(entryId: string) {
    const lineEntry = values.lineEntries.find((entry) => entry.id === entryId);

    if (!lineEntry) {
      return;
    }

    setTaxEditorTarget({ kind: "entry", entryId });
    setTaxEditorValues(lineEntry.taxDetails);
  }

  function handleSaveTaxDetails(nextTaxDetails: DisbursementTaxDetails) {
    if (!taxEditorTarget) {
      return;
    }

    const summary = formatTaxRateSummary(nextTaxDetails);

    updateField(
      "lineEntries",
      values.lineEntries.map((entry) =>
        entry.id === taxEditorTarget.entryId
          ? {
              ...entry,
              taxRate: summary,
              taxDetails: nextTaxDetails,
            }
          : entry,
      ),
    );

    setTaxEditorTarget(null);
    setTaxEditorValues(null);
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const detailsErrors = validateDisbursementVoucherDetails(values);
    const entryErrors = validateDisbursementVoucherEntries(values);
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(
        detailsErrors.transactionId || detailsErrors.amount
          ? "details"
          : "entries",
      );
      return;
    }

    if (mode === "edit" && existingVoucher) {
      updateVoucher(updateDisbursementVoucherFromForm(existingVoucher, values));
    } else {
      addVoucher(createDisbursementVoucherFromForm(values));
    }

    router.push(DisbursementVoucherHref);
  }

  function handleConfirmDelete() {
    if (!existingVoucher) {
      return;
    }

    deleteVoucher(existingVoucher.id);
    setIsDeleteDialogOpen(false);
    router.push(DisbursementVoucherHref);
  }

  function handleOpenDrawer(nextMode: "add" | "edit") {
    if (!selectedTransaction) {
      return;
    }

    setDrawerState({
      mode: nextMode,
      row: {
        transaction: selectedTransaction,
        voucher: existingVoucher,
      },
    });
  }

  function handleCloseDrawer() {
    setDrawerState(null);
  }

  function handleSaveDrawer(nextValues: DisbursementVoucherFormValues) {
    if (drawerState?.mode === "edit" && existingVoucher) {
      updateVoucher(updateDisbursementVoucherFromForm(existingVoucher, nextValues));
    } else {
      addVoucher(createDisbursementVoucherFromForm(nextValues));
    }

    setDrawerState(null);
  }

  if (isReadonly) {
    return (
      <>
        <section className="grid gap-6">
          <DisbursementVoucherActionHeader
            canCreateAnother={!existingVoucher}
            mode={mode}
            transaction={selectedTransaction}
            voucher={existingVoucher}
            onCreateVoucher={() => handleOpenDrawer("add")}
            onEditVoucher={
              existingVoucher ? () => handleOpenDrawer("edit") : undefined
            }
            onDeleteVoucher={
              existingVoucher ? () => setIsDeleteDialogOpen(true) : undefined
            }
          />
          <VoucherPreviewPanel
            transaction={selectedTransaction}
            voucher={existingVoucher}
          />
        </section>
        <AppDialog
          isOpen={isDeleteDialogOpen}
          isPending={isMutating}
          title="Delete this voucher?"
          description={`This will remove ${existingVoucher?.voucherNo ?? "the selected voucher"} from the preview table.`}
          confirmLabel="Delete Voucher"
          tone="danger"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
        <DisbursementVoucherDrawer
          isOpen={Boolean(drawerState)}
          mode={drawerState?.mode ?? "add"}
          transaction={selectedTransaction}
          transactions={transactions}
          voucher={existingVoucher}
          onClose={handleCloseDrawer}
          onSave={handleSaveDrawer}
        />
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <DisbursementVoucherActionHeader
          currentStep={step}
          mode={mode}
          transaction={selectedTransaction}
          voucher={existingVoucher}
          onSubmit={() => handleSubmit()}
        />

        <div className="grid gap-6">
          {step === "entries" ? (
            <VoucherEntriesStep
              errors={errors}
              entries={values.lineEntries}
              isBalanced={isBalanced}
              onApplyAutoEntries={handleApplyAutoEntries}
              onAddEntries={handleAddEntries}
              onClearEntries={handleClearEntries}
              onDuplicateEntry={handleDuplicateEntry}
              onInsertEntry={handleInsertEntry}
              onMoveEntry={handleMoveEntry}
              onOpenEntryTaxEditor={handleOpenEntryTaxEditor}
              onUpdateEntry={handleUpdateEntry}
              totalCredit={totalCredit}
              totalDebit={totalDebit}
              onBack={() => setStep("details")}
              onProceed={handleProceedFromEntries}
              onRemoveEntry={handleRemoveEntry}
            />
          ) : null}
          {step === "review" ? (
            <VoucherReviewStep
              selectedTransaction={selectedTransaction}
              totalCredit={totalCredit}
              totalDebit={totalDebit}
              values={values}
              onBack={() => setStep("entries")}
            />
          ) : null}
        </div>
      </form>

      <AppDialog
        isOpen={isDeleteDialogOpen}
        isPending={isMutating}
        title="Delete this voucher?"
        description={`This will remove ${existingVoucher?.voucherNo ?? "the selected voucher"} from the preview table.`}
        confirmLabel="Delete Voucher"
        tone="danger"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <TaxDetailsDialog
        isOpen={Boolean(taxEditorTarget && taxEditorValues)}
        values={taxEditorValues}
        onCancel={() => {
          setTaxEditorTarget(null);
          setTaxEditorValues(null);
        }}
        onSave={handleSaveTaxDetails}
      />
    </>
  );
}

function getActionMode(pathname: string): DisbursementVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function VoucherWorkflowSkeleton() {
  return (
    <section className="grid gap-6">
      <div className="h-28 animate-pulse rounded-[28px] bg-darknavy/6" />
      <div className="h-[36rem] animate-pulse rounded-[28px] bg-darknavy/6" />
    </section>
  );
}

function VoucherEntriesStep({
  entries,
  errors,
  isBalanced,
  onAddEntries,
  onApplyAutoEntries,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onOpenEntryTaxEditor,
  onUpdateEntry,
  totalCredit,
  totalDebit,
  onBack,
  onProceed,
  onRemoveEntry,
}: {
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isBalanced: boolean;
  onAddEntries: (count: number) => void;
  onApplyAutoEntries: () => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onOpenEntryTaxEditor: (entryId: string) => void;
  onUpdateEntry: (
    entryId: string,
    field: keyof DisbursementLineEntry,
    value: string | number,
  ) => void;
  totalCredit: number;
  totalDebit: number;
  onBack: () => void;
  onProceed: () => void;
  onRemoveEntry: (entryId: string) => void;
}) {
  const columns = useMemo<ModuleDataEntryColumn<DisbursementLineEntry>[]>(
    () => [
      {
        header: "Account Code",
        id: "accountCode",
        widthClassName: "w-[12rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.accountCode}
            onChange={(value) =>
              onUpdateEntry(entry.id, "accountCode", value)
            }
          />
        ),
      },
      {
        header: "Account Name",
        id: "accountName",
        widthClassName: "w-[16rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.accountName}
            onChange={(value) =>
              onUpdateEntry(entry.id, "accountName", value)
            }
          />
        ),
      },
      {
        header: "Particulars",
        id: "particulars",
        widthClassName: "w-[22rem]",
        renderCell: (entry) => (
          <EntryInput
            value={entry.particulars}
            onChange={(value) =>
              onUpdateEntry(entry.id, "particulars", value)
            }
          />
        ),
      },
      {
        header: "Tax Rate",
        id: "taxRate",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <button
            type="button"
            onClick={() => onOpenEntryTaxEditor(entry.id)}
            className={joinClasses(
              accountingCellControlClassName(),
              "flex items-center justify-between gap-2 text-left",
            )}
          >
            <span className="truncate">
              {formatTaxRateSummary(entry.taxDetails)}
            </span>
            <Percent className="h-4 w-4 shrink-0 text-darknavy/45" />
          </button>
        ),
      },
      {
        header: "Debit",
        id: "debit",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.debit}
            onChange={(value) => onUpdateEntry(entry.id, "debit", value)}
          />
        ),
      },
      {
        header: "Credit",
        id: "credit",
        widthClassName: "w-[11rem]",
        renderCell: (entry) => (
          <EntryNumberInput
            value={entry.credit}
            onChange={(value) => onUpdateEntry(entry.id, "credit", value)}
          />
        ),
      },
      {
        header: "Status",
        id: "status",
        widthClassName: "w-[10rem]",
        renderCell: (entry) => (
          <select
            value={entry.status}
            onChange={(event) =>
              onUpdateEntry(entry.id, "status", event.target.value)
            }
            className={accountingCellControlClassName()}
          >
            <option value="Pending">Pending</option>
            <option value="Balanced">Balanced</option>
          </select>
        ),
      },
    ],
    [onOpenEntryTaxEditor, onUpdateEntry],
  );

  return (
    <section className="rounded-[28px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]">
      <div className="border-b border-darknavy/8 px-5 py-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
              Accounting Entries
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-darknavy">
              Encode journal lines in a table layout
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-darknavy/58">
              Enter each line directly into the journal-style grid below. This
              layout is designed to feel faster for accounting encoding and
              easier to review before balancing.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isBalanced
                ? "bg-citron/25 text-darknavy"
                : "bg-coralpink/12 text-coralpink"
            }`}
          >
            {isBalanced ? "Balanced" : "Needs adjustment"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onApplyAutoEntries}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/40 hover:bg-skyblue/8"
          >
            <CirclePlus className="h-4 w-4" aria-hidden="true" />
            Auto Entries
          </button>
          <p className="text-sm text-darknavy/55">
            Rebuild default debit and credit lines from the selected
            transaction.
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <ModuleDataEntry
          columns={columns}
          description="Add accounting lines, adjust debit and credit amounts, reorder rows, and manage duplicate journal entries."
          emptyRowLabel="entry"
          error={errors.lineEntries}
          isDraggable
          isReadonly={false}
          rows={entries}
          title="Data Entry"
          onAddRows={onAddEntries}
          onClearRows={onClearEntries}
          onDuplicateRow={onDuplicateEntry}
          onInsertRow={onInsertEntry}
          onMoveRow={onMoveEntry}
          onRemoveRow={onRemoveEntry}
        />

        <div className="mt-4 grid gap-3 rounded-lg border border-darknavy/10 bg-offwhite/50 p-4 text-sm font-semibold text-darknavy sm:grid-cols-4">
          <div>
            <span className="block text-xs uppercase tracking-[0.16em] text-darknavy/45">
              Debit
            </span>
            <span className="mt-1 block">{formatCurrency(totalDebit)}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-[0.16em] text-darknavy/45">
              Credit
            </span>
            <span className="mt-1 block">{formatCurrency(totalCredit)}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-[0.16em] text-darknavy/45">
              Variance
            </span>
            <span className="mt-1 block">
              {formatCurrency(Math.abs(totalDebit - totalCredit))}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-[0.16em] text-darknavy/45">
              Status
            </span>
            <span
              className={joinClasses(
                "mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                isBalanced
                  ? "bg-citron/30 text-darknavy"
                  : "bg-coralpink/12 text-coralpink",
              )}
            >
              {isBalanced ? "Balanced" : "Waiting for balance"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-full border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy"
          >
            Back to Voucher Details
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="theme-accent-contrast-text inline-flex h-11 items-center justify-center rounded-full bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </section>
  );
}

function EntryInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={accountingCellControlClassName()}
    />
  );
}

function EntryNumberInput({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <input
      type="number"
      min="0"
      value={value || ""}
      onChange={(event) => onChange(Number(event.target.value))}
      className={accountingCellControlClassName("text-right")}
    />
  );
}

function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:bg-offwhite/45",
    extraClassName,
  );
}

function shouldClearEntry(
  entry: DisbursementLineEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return disbursementEntryHasData(entry);
  }

  if (action === "incomplete") {
    return disbursementEntryHasData(entry) && !disbursementEntryIsComplete(entry);
  }

  return !disbursementEntryHasData(entry);
}

function disbursementEntryHasData(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountName.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    Number(entry.debit || 0) > 0 ||
    Number(entry.credit || 0) > 0 ||
    entry.taxRate !== "0%"
  );
}

function disbursementEntryIsComplete(entry: DisbursementLineEntry) {
  return (
    entry.accountCode.trim() !== "" &&
    entry.accountName.trim() !== "" &&
    entry.particulars.trim() !== "" &&
    (Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0)
  );
}

function TaxDetailsDialog({
  isOpen,
  values,
  onCancel,
  onSave,
}: {
  isOpen: boolean;
  values: DisbursementTaxDetails | null;
  onCancel: () => void;
  onSave: (values: DisbursementTaxDetails) => void;
}) {
  if (!isOpen || !values) {
    return null;
  }

  return (
    <TaxDetailsDialogEditor
      key={JSON.stringify(values)}
      initialValues={values}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}

function TaxDetailsDialogEditor({
  initialValues,
  onCancel,
  onSave,
}: {
  initialValues: DisbursementTaxDetails;
  onCancel: () => void;
  onSave: (values: DisbursementTaxDetails) => void;
}) {
  const [draftValues, setDraftValues] = useState(initialValues);

  function updateTaxValue<TKey extends keyof DisbursementTaxDetails>(
    field: TKey,
    value: DisbursementTaxDetails[TKey],
  ) {
    setDraftValues((current) => {
      if (!current) {
        return current;
      }

      const nextValues = { ...current, [field]: value };
      const nextVatPercent =
        field === "vatCode"
          ? getPercentFromTaxCode(String(value))
          : nextValues.vatPercent;
      const nextEwtPercent =
        field === "ewtCode"
          ? getPercentFromTaxCode(String(value))
          : nextValues.ewtPercent;
      const vatAmount = Number(
        ((nextValues.grossAmount * nextVatPercent) / 100).toFixed(2),
      );
      const ewtAmount = Number(
        ((nextValues.grossAmount * nextEwtPercent) / 100).toFixed(2),
      );
      const netAmount = Number((nextValues.grossAmount - ewtAmount).toFixed(2));

      return {
        ...nextValues,
        vatPercent: nextVatPercent,
        ewtPercent: nextEwtPercent,
        vatAmount,
        ewtAmount,
        netAmount,
        amount: netAmount,
      };
    });
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-darknavy/45 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-darknavy/10 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.24)]">
        <div className="flex items-center justify-between border-b border-darknavy/8 px-5 py-4">
          <h3 className="text-xl font-semibold text-darknavy">Tax</h3>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-darknavy/55 transition hover:bg-darknavy/6"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">Gross Amount :</label>
            <input
              value={formatNumberInput(draftValues.grossAmount)}
              readOnly
              className={DisabledFieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">Net Amount :</label>
            <input
              value={formatNumberInput(draftValues.netAmount)}
              readOnly
              className={DisabledFieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">VAT Code :</label>
            <select
              value={draftValues.vatCode}
              onChange={(event) =>
                updateTaxValue("vatCode", event.target.value)
              }
              className={`${ModalFieldClassName} app-select-control`}
            >
              <option value="">--Select VAT Rate--</option>
              <option value="VAT-0">Zero Rated</option>
              <option value="VAT-5">Expanded VAT 5%</option>
              <option value="VAT-12">Standard VAT 12%</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">Percent :</label>
            <input
              value={formatPercentInput(draftValues.vatPercent)}
              onChange={(event) =>
                updateTaxValue(
                  "vatPercent",
                  Number.parseFloat(event.target.value) || 0,
                )
              }
              className={`${ModalFieldClassName} app-select-control`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">VAT Amount :</label>
            <input
              value={formatNumberInput(draftValues.vatAmount)}
              readOnly
              className={DisabledFieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">EWT Code :</label>
            <select
              value={draftValues.ewtCode}
              onChange={(event) =>
                updateTaxValue("ewtCode", event.target.value)
              }
              className={ModalFieldClassName}
            >
              <option value="">--Select EWT Code--</option>
              <option value="EWT-1">Professional Fee 1%</option>
              <option value="EWT-2">Rental 2%</option>
              <option value="EWT-5">General 5%</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">Percent :</label>
            <input
              value={formatPercentInput(draftValues.ewtPercent)}
              onChange={(event) =>
                updateTaxValue(
                  "ewtPercent",
                  Number.parseFloat(event.target.value) || 0,
                )
              }
              className={ModalFieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">EWT Amount :</label>
            <input
              value={formatNumberInput(draftValues.ewtAmount)}
              readOnly
              className={DisabledFieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
            <label className="text-sm text-darknavy/75">Amount :</label>
            <input
              value={formatNumberInput(draftValues.amount)}
              readOnly
              className={DisabledFieldClassName}
            />
          </div>
        </div>
        <div className="border-t border-darknavy/8 px-5 py-4">
          <button
            type="button"
            onClick={() => onSave(draftValues)}
            className="theme-accent-contrast-text inline-flex h-11 w-full items-center justify-center rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

const ModalFieldClassName =
  "app-theme-field h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:border-skyblue/45";

const DisabledFieldClassName =
  "app-theme-field-readonly h-11 w-full rounded-md border px-3 text-right text-sm outline-none";

function formatNumberInput(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercentInput(value: number) {
  return value.toFixed(2);
}

function getPercentFromTaxCode(code: string) {
  const matchedPercent = code.match(/(\d+)(?!.*\d)/);

  return matchedPercent ? Number.parseFloat(matchedPercent[1]) : 0;
}

function VoucherReviewStep({
  selectedTransaction,
  totalCredit,
  totalDebit,
  values,
  onBack,
}: {
  selectedTransaction?: DisbursementTransactionRecord;
  totalCredit: number;
  totalDebit: number;
  values: DisbursementVoucherFormValues;
  onBack: () => void;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <CardShell
        eyebrow="Attachments"
        title="Supporting files"
        description="This mock flow uses generated placeholders so the review layout stays realistic."
      >
        <div className="rounded-[22px] border border-dashed border-darknavy/14 bg-white p-5">
          <div className="flex h-28 items-center justify-center rounded-[18px] border border-dashed border-skyblue/35 bg-skyblue/8">
            <div className="text-center">
              <Paperclip className="mx-auto h-5 w-5 text-darknavy/55" />
              <p className="mt-3 text-sm font-medium text-darknavy">
                Attachments ready for reviewer handoff
              </p>
              <p className="mt-1 text-xs text-darknavy/50">
                Files are mock placeholders tied to the selected transaction.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {values.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-[18px] border border-darknavy/10 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-darknavy">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-darknavy/50">
                    {attachment.sizeLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell
        eyebrow="Final Review"
        title="Confirm every detail before saving"
        description="This review consolidates the transaction origin, voucher setup, and ledger entries into one approval-ready view."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <ReviewCard title="Voucher Details">
            <InfoLine label="Voucher no." value={values.voucherNo} />
            <InfoLine
              label="Date"
              value={formatDateLabel(values.voucherDate)}
            />
            <InfoLine label="Payment method" value={values.paymentMethod} />
            <InfoLine
              label="Purpose"
              value={selectedTransaction?.purpose ?? values.remarks}
            />
          </ReviewCard>
          <ReviewCard title="Party and Amount">
            <InfoLine label="Party Name" value={values.vceName} />
            <InfoLine label="Party Code" value={values.vceCode} />
            <InfoLine
              label="Total amount"
              value={formatCurrency(Number(values.amount))}
            />
            <InfoLine label="Cost center" value={values.costCenter} />
          </ReviewCard>
        </div>

        <div className="mt-4 rounded-[22px] border border-darknavy/10 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
                Line Entries
              </p>
              <p className="mt-2 text-sm text-darknavy/60">
                {values.lineEntries.length} entries prepared for posting.
              </p>
            </div>
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                onBack();
              }}
              className="text-sm font-semibold text-skyblue"
            >
              Edit Entries
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {values.lineEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[18px] border border-darknavy/8 bg-offwhite/65 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-darknavy">
                      {entry.accountCode} - {entry.accountName}
                    </p>
                    <p className="mt-1 text-sm text-darknavy/58">
                      {entry.particulars}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-darknavy">
                    {formatCurrency(entry.debit || entry.credit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-darknavy/10 pt-4 text-sm text-darknavy/65">
            <div className="flex items-center justify-between">
              <span>Total debit</span>
              <span>{formatCurrency(totalDebit)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Total credit</span>
              <span>{formatCurrency(totalCredit)}</span>
            </div>
            <div className="theme-accent-contrast-text mt-3 flex items-center justify-between rounded-[16px] bg-skyblue px-4 py-3 shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.2)]">
              <span className="font-semibold">Total disbursement</span>
              <span className="text-lg font-semibold">
                {formatCurrency(Number(values.amount))}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-full border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy"
          >
            Back to Entries
          </button>
          <p className="rounded-full bg-citron/35 px-4 py-2 text-sm font-semibold text-darknavy">
            Ready to save. Use the top-right Save Voucher action to finish.
          </p>
        </div>
      </CardShell>
    </section>
  );
}

function VoucherPreviewPanel({
  transaction,
  voucher,
}: {
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <CardShell
        eyebrow="Transaction Preview"
        title={transaction?.payee ?? "Transaction"}
        description="This panel shows the source transaction that the voucher workflow will use."
      >
        <div className="grid gap-3">
          <InfoLine
            label="Transaction no."
            value={transaction?.transactionNo ?? "-"}
          />
          <InfoLine label="Department" value={transaction?.department ?? "-"} />
          <InfoLine
            label="Requested by"
            value={transaction?.requestedBy ?? "-"}
          />
          <InfoLine
            label="Amount"
            value={transaction ? formatCurrency(transaction.amount) : "-"}
          />
          <InfoLine
            label="Purpose"
            value={transaction?.purpose ?? "No transaction purpose available."}
          />
        </div>
      </CardShell>

      <CardShell
        eyebrow="Voucher Status"
        title={voucher?.voucherNo ?? "No voucher linked yet"}
        description={
          voucher
            ? "A linked voucher exists for this transaction and can be reviewed or edited."
            : "This transaction is ready for voucher creation. Use New Voucher to begin the multi-step workflow."
        }
      >
        {voucher ? (
          <>
            <div className="grid gap-3">
              <InfoLine
                label="Voucher date"
                value={formatDateLabel(voucher.voucherDate)}
              />
              <InfoLine label="Payment method" value={voucher.paymentMethod} />
              <InfoLine label="Prepared by" value={voucher.preparedBy} />
              <InfoLine label="Status" value={voucher.status} />
              <InfoLine label="Remarks" value={voucher.remarks} />
            </div>
            <div className="theme-accent-contrast-text mt-5 rounded-[18px] bg-skyblue p-4 shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                Linked voucher amount
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(voucher.amount)}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-[18px] border border-dashed border-darknavy/14 bg-offwhite/45 p-5 text-sm leading-6 text-darknavy/62">
            No voucher has been created for this transaction yet. The New
            Voucher action will prefill the transaction details so finance can
            proceed through the guided workflow.
          </div>
        )}
      </CardShell>
    </div>
  );
}

function CardShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section
      className="min-h-[18rem] rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5 lg:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-semibold leading-tight text-darknavy">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ReviewCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[22px] border border-darknavy/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
        {title}
      </p>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function InfoLine({
  invert = false,
  label,
  value,
}: {
  invert?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1">
      <dt
        className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
          invert ? "text-white/55" : "text-darknavy/38"
        }`}
      >
        {label}
      </dt>
      <dd
        className={
          invert
            ? "text-sm font-medium text-white"
            : "text-sm font-medium text-darknavy"
        }
      >
        {value}
      </dd>
    </div>
  );
}
