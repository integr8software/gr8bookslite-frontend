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
  Trash2,
  X,
} from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherInitialEntryDraft,
  createAttachmentPlaceholders,
  createAutoDisbursementLineEntries,
  createDisbursementLineEntry,
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
  validateDisbursementEntryDraft,
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherActionHeader } from "./DisbursementVoucherActionHeader";
import { DisbursementVoucherNotFound } from "./DisbursementVoucherNotFound";

const FieldInputClassName =
  "h-12 w-full rounded-2xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-skyblue/6";

export function DisbursementVoucherAction() {
  return (
    <Suspense fallback={<VoucherWorkflowSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

type TaxEditorTarget =
  | { kind: "draft" }
  | { kind: "entry"; entryId: string }
  | null;

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
  const [selectedTransactionId, setSelectedTransactionId] =
    useState(initialTransactionId);
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
  const [entryDraft, setEntryDraft] = useState<DisbursementVoucherEntryDraft>(
    DisbursementVoucherInitialEntryDraft,
  );
  const [step, setStep] = useState<WorkflowStep>("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taxEditorTarget, setTaxEditorTarget] = useState<TaxEditorTarget>(null);
  const [taxEditorValues, setTaxEditorValues] =
    useState<DisbursementTaxDetails | null>(null);
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

  function handleDraftChange(nextDraft: DisbursementVoucherEntryDraft) {
    const amount =
      Number(nextDraft.debit || 0) || Number(nextDraft.credit || 0);

    setEntryDraft({
      ...nextDraft,
      taxDetails: syncTaxDetailsAmount(
        nextDraft.taxDetails,
        amount,
        nextDraft.taxRate,
      ),
    });
  }

  function handleSelectTransaction(nextTransactionId: string) {
    if (isReadonly) {
      return;
    }

    const nextTransaction = transactions.find(
      (transaction) => transaction.id === nextTransactionId,
    );

    setSelectedTransactionId(nextTransactionId);
    setValues((current) => {
      const nextValues = createDisbursementVoucherFormValues(nextTransaction);

      return {
        ...nextValues,
        remarks: current.remarks || nextValues.remarks,
        lineEntries:
          current.lineEntries.length > 0
            ? current.lineEntries
            : nextTransaction
              ? createAutoDisbursementLineEntries(nextTransaction)
              : [],
        attachments:
          current.attachments.length > 0
            ? current.attachments
            : nextTransaction
              ? createAttachmentPlaceholders(nextTransaction)
              : [],
      };
    });
    setErrors((current) => ({ ...current, transactionId: undefined }));
  }

  function handleProceedFromDetails() {
    const nextErrors = validateDisbursementVoucherDetails(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (values.attachments.length === 0 && selectedTransaction) {
      updateField(
        "attachments",
        createAttachmentPlaceholders(selectedTransaction),
      );
    }

    if (values.lineEntries.length === 0 && selectedTransaction) {
      updateField(
        "lineEntries",
        createAutoDisbursementLineEntries(selectedTransaction),
      );
    }

    setStep("entries");
  }

  function handleProceedFromEntries() {
    const nextErrors = validateDisbursementVoucherEntries(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStep("review");
  }

  function handleAddEntry() {
    const nextError = validateDisbursementEntryDraft(entryDraft);

    if (nextError) {
      setErrors((current) => ({ ...current, entryDraft: nextError }));
      return;
    }

    updateField("lineEntries", [
      ...values.lineEntries,
      createDisbursementLineEntry(entryDraft),
    ]);
    setEntryDraft(DisbursementVoucherInitialEntryDraft);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    updateField(
      "lineEntries",
      values.lineEntries.filter((entry) => entry.id !== entryId),
    );
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

  function handleOpenDraftTaxEditor() {
    setTaxEditorTarget({ kind: "draft" });
    setTaxEditorValues(entryDraft.taxDetails);
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

    if (taxEditorTarget.kind === "draft") {
      handleDraftChange({
        ...entryDraft,
        taxRate: summary,
        taxDetails: nextTaxDetails,
      });
    } else {
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
    }

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

  if (isReadonly) {
    return (
      <>
        <section className="grid gap-6">
          <DisbursementVoucherActionHeader
            canCreateAnother={!existingVoucher}
            mode={mode}
            transaction={selectedTransaction}
            voucher={existingVoucher}
            onDeleteVoucher={
              existingVoucher ? () => setIsDeleteDialogOpen(true) : undefined
            }
          />
          <VoucherPreviewPanel
            transaction={selectedTransaction}
            voucher={existingVoucher}
          />
        </section>
        <AppConfirmDialog
          isOpen={isDeleteDialogOpen}
          isPending={isMutating}
          title="Delete this voucher?"
          description={`This will remove ${existingVoucher?.voucherNo ?? "the selected voucher"} from the preview table.`}
          confirmLabel="Delete Voucher"
          tone="danger"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
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
          {step === "details" ? (
            <VoucherDetailsStep
              errors={errors}
              transactionOptions={transactions}
              selectedTransaction={selectedTransaction}
              values={values}
              onProceed={handleProceedFromDetails}
              onSelectTransaction={handleSelectTransaction}
              onUpdateField={updateField}
            />
          ) : null}
          {step === "entries" ? (
            <VoucherEntriesStep
              entryDraft={entryDraft}
              errors={errors}
              entries={values.lineEntries}
              isBalanced={isBalanced}
              onApplyAutoEntries={handleApplyAutoEntries}
              onDraftChange={handleDraftChange}
              onOpenDraftTaxEditor={handleOpenDraftTaxEditor}
              onOpenEntryTaxEditor={handleOpenEntryTaxEditor}
              totalCredit={totalCredit}
              totalDebit={totalDebit}
              onAddEntry={handleAddEntry}
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

      <AppConfirmDialog
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

function VoucherDetailsStep({
  errors,
  selectedTransaction,
  transactionOptions,
  values,
  onProceed,
  onSelectTransaction,
  onUpdateField,
}: {
  errors: DisbursementVoucherFormErrors;
  selectedTransaction?: DisbursementTransactionRecord;
  transactionOptions: DisbursementTransactionRecord[];
  values: DisbursementVoucherFormValues;
  onProceed: () => void;
  onSelectTransaction: (transactionId: string) => void;
  onUpdateField: <TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) => void;
}) {}

function VoucherEntriesStep({
  entryDraft,
  entries,
  errors,
  isBalanced,
  onApplyAutoEntries,
  onDraftChange,
  onOpenDraftTaxEditor,
  onOpenEntryTaxEditor,
  totalCredit,
  totalDebit,
  onAddEntry,
  onBack,
  onProceed,
  onRemoveEntry,
}: {
  entryDraft: DisbursementVoucherEntryDraft;
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isBalanced: boolean;
  onApplyAutoEntries: () => void;
  onDraftChange: (draft: DisbursementVoucherEntryDraft) => void;
  onOpenDraftTaxEditor: () => void;
  onOpenEntryTaxEditor: (entryId: string) => void;
  totalCredit: number;
  totalDebit: number;
  onAddEntry: () => void;
  onBack: () => void;
  onProceed: () => void;
  onRemoveEntry: (entryId: string) => void;
}) {
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
        <div className="overflow-hidden rounded-[22px] border border-darknavy/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                <tr>
                  <th className="px-4 py-3">Account Code</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Particulars</th>
                  <th className="px-4 py-3">Debit</th>
                  <th className="px-4 py-3">Credit</th>
                  <th className="px-4 py-3">Tax Rate</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-darknavy/8 bg-skyblue/6 align-top">
                  <td className="px-4 py-4">
                    <input
                      value={entryDraft.accountCode}
                      onChange={(event) =>
                        onDraftChange({
                          ...entryDraft,
                          accountCode: event.target.value,
                        })
                      }
                      className={`${FieldInputClassName} h-11 rounded-xl bg-white`}
                      placeholder="e.g. 5010-001"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      value={entryDraft.accountName}
                      onChange={(event) =>
                        onDraftChange({
                          ...entryDraft,
                          accountName: event.target.value,
                        })
                      }
                      className={`${FieldInputClassName} h-11 rounded-xl bg-white`}
                      placeholder="Office Supplies Expense"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      value={entryDraft.particulars}
                      onChange={(event) =>
                        onDraftChange({
                          ...entryDraft,
                          particulars: event.target.value,
                        })
                      }
                      className={`${FieldInputClassName} h-11 rounded-xl bg-white`}
                      placeholder="Describe the transaction line"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      value={entryDraft.debit}
                      onChange={(event) =>
                        onDraftChange({
                          ...entryDraft,
                          debit: event.target.value,
                        })
                      }
                      className={`${FieldInputClassName} h-11 rounded-xl bg-white`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      value={entryDraft.credit}
                      onChange={(event) =>
                        onDraftChange({
                          ...entryDraft,
                          credit: event.target.value,
                        })
                      }
                      className={`${FieldInputClassName} h-11 rounded-xl bg-white`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={onOpenDraftTaxEditor}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-darknavy/12 bg-white px-3 text-sm text-darknavy transition hover:border-skyblue/40"
                    >
                      <span className="truncate">
                        {formatTaxRateSummary(entryDraft.taxDetails)}
                      </span>
                      <Percent className="h-4 w-4 shrink-0 text-darknavy/45" />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={onAddEntry}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-darknavy px-4 text-sm font-semibold text-white transition hover:bg-darknavy/92"
                    >
                      <CirclePlus className="h-4 w-4" aria-hidden="true" />
                      Add
                    </button>
                  </td>
                </tr>
                {errors.entryDraft ? (
                  <tr className="border-t border-darknavy/8 bg-coralpink/8">
                    <td
                      colSpan={7}
                      className="px-4 py-3 text-sm font-medium text-coralpink"
                    >
                      {errors.entryDraft}
                    </td>
                  </tr>
                ) : null}
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-darknavy/8">
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {entry.accountCode}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-darknavy">
                          {entry.accountName}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm leading-6 text-darknavy/65">
                        {entry.particulars}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/65">
                        <button
                          type="button"
                          onClick={() => onOpenEntryTaxEditor(entry.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-darknavy/12 bg-white px-3 py-1.5 text-xs font-semibold text-darknavy transition hover:border-skyblue/40"
                        >
                          <Percent className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatTaxRateSummary(entry.taxDetails)}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveEntry(entry.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-coralpink transition hover:bg-coralpink/10"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-darknavy/55"
                    >
                      No line entries yet. Start encoding in the first row
                      above.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t border-darknavy/8 bg-offwhite/60 text-sm font-semibold text-darknavy">
                <tr>
                  <td className="px-4 py-4">Totals</td>
                  <td />
                  <td />
                  <td className="px-4 py-4">{formatCurrency(totalDebit)}</td>
                  <td className="px-4 py-4">{formatCurrency(totalCredit)}</td>
                  <td className="px-4 py-4">
                    {entries.length} {entries.length === 1 ? "line" : "lines"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {isBalanced ? "Balanced" : "Waiting for balance"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {errors.lineEntries ? (
          <p className="mt-4 text-sm font-medium text-coralpink">
            {errors.lineEntries}
          </p>
        ) : null}

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
            className="inline-flex h-11 items-center justify-center rounded-full bg-darknavy px-5 text-sm font-semibold text-white"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </section>
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
              className={ModalFieldClassName}
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
              className={ModalFieldClassName}
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
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

const ModalFieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45";

const DisabledFieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-darknavy/[0.04] px-3 text-right text-sm text-darknavy/75 outline-none";

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
        tone="offwhite"
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
        tone="citron"
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
          <ReviewCard title="Payee and Amount">
            <InfoLine label="Payee" value={values.vceName} />
            <InfoLine label="VCE code" value={values.vceCode} />
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
            <div className="mt-3 flex items-center justify-between rounded-[16px] bg-darknavy px-4 py-3 text-white">
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
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <CardShell
        eyebrow="Transaction Preview"
        title={transaction?.payee ?? "Transaction"}
        description="This panel shows the source transaction that the voucher workflow will use."
        tone="offwhite"
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
        tone="citron"
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
            <div className="mt-5 rounded-[18px] bg-darknavy p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Linked voucher amount
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(voucher.amount)}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-[22px] border border-dashed border-darknavy/14 bg-white p-6 text-sm leading-6 text-darknavy/58">
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
  tone = "white",
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  tone?: "white" | "sky" | "citron" | "offwhite";
}) {
  const toneClassName =
    tone === "sky"
      ? "bg-[linear-gradient(180deg,rgba(87,196,229,0.12),rgba(255,255,255,1))]"
      : tone === "citron"
        ? "bg-[linear-gradient(180deg,rgba(209,214,70,0.18),rgba(255,255,255,1))]"
        : tone === "offwhite"
          ? "bg-[linear-gradient(180deg,rgba(236,242,239,0.92),rgba(255,255,255,1))]"
          : "bg-white";

  return (
    <section
      className={`rounded-[28px] border border-darknavy/10 p-5 shadow-[0_18px_60px_rgba(33,39,56,0.08)] lg:p-6 ${toneClassName}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-darknavy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldBlock({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/48">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-sm font-medium text-coralpink">{error}</span>
      ) : null}
    </label>
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
