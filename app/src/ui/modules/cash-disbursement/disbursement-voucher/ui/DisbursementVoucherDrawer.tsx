"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CirclePlus, FileText, Paperclip, Plus, Trash2 } from "lucide-react";
import {
  DisbursementVoucherInitialEntryDraft,
  createAttachmentPlaceholders,
  createAutoDisbursementLineEntries,
  createDisbursementLineEntry,
  createDisbursementVoucherFormValues,
  formatCurrency,
  formatDateLabel,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  validateDisbursementEntryDraft,
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
  AppPaymentTypeDialog,
  InitialAppPaymentTypeRecords,
  type AppPaymentTypeRecord,
} from "@/app/src/ui/shared/system/AppPaymentTypeDialog";
import type {
  DisbursementLineEntry,
  DisbursementPaymentMethod,
  DisbursementTransactionRecord,
  DisbursementType,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  VoucherCurrency,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type DrawerMode = "add" | "edit";
type DrawerTab = "cash-disbursement" | "file-attachment";

type DisbursementVoucherDrawerProps = {
  isOpen: boolean;
  mode: DrawerMode;
  transaction?: DisbursementTransactionRecord;
  transactions: DisbursementTransactionRecord[];
  voucher?: DisbursementVoucherRecord;
  onClose: () => void;
  onSave: (values: DisbursementVoucherFormValues) => void;
};

export function DisbursementVoucherDrawer({
  isOpen,
  mode,
  transaction,
  transactions,
  voucher,
  onClose,
  onSave,
}: DisbursementVoucherDrawerProps) {
  return (
    <DrawerPanel
      key={`${mode}-${transaction?.id ?? "blank"}-${voucher?.id ?? "new"}`}
      isOpen={isOpen}
      mode={mode}
      transaction={transaction}
      transactions={transactions}
      voucher={voucher}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function DrawerPanel({
  isOpen,
  mode,
  transaction,
  transactions,
  voucher,
  onClose,
  onSave,
}: DisbursementVoucherDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("cash-disbursement");
  const [step, setStep] = useState<WorkflowStep>("details");
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const [paymentTypeRecords, setPaymentTypeRecords] = useState<AppPaymentTypeRecord[]>(
    InitialAppPaymentTypeRecords,
  );
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createDisbursementVoucherFormValues(transaction, voucher),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [entryDraft, setEntryDraft] = useState<DisbursementVoucherEntryDraft>(
    DisbursementVoucherInitialEntryDraft,
  );
  const [transactionNumber, setTransactionNumber] = useState(
    transaction?.transactionNo ?? "",
  );
  const isEditing = mode === "edit";
  const matchedTransaction = useMemo(
    () =>
      transactions.find(
        (currentTransaction) =>
          currentTransaction.transactionNo === transactionNumber.trim(),
      ),
    [transactionNumber, transactions],
  );
  const selectedTransaction = matchedTransaction ?? transaction;
  const activePaymentTypeOptions = useMemo(
    () =>
      paymentTypeRecords
        .filter((record) => record.status === "Active")
        .map((record) => record.paymentType),
    [paymentTypeRecords],
  );
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

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function syncTransaction(nextTransaction?: DisbursementTransactionRecord) {
    if (!nextTransaction) {
      setValues((current) => ({
        ...current,
        transactionId: "",
      }));
      return;
    }

    const nextDefaults = createDisbursementVoucherFormValues(
      nextTransaction,
      isEditing ? voucher : undefined,
    );

    setValues((current) => ({
      ...current,
      transactionId: nextTransaction.id,
      paymentMethod: nextDefaults.paymentMethod,
      disbursementType: nextDefaults.disbursementType,
      currency: nextDefaults.currency,
      amount: nextDefaults.amount,
      remarks: nextDefaults.remarks,
      costCenter: nextDefaults.costCenter,
      vceName: current.vceName.trim() ? current.vceName : nextDefaults.vceName,
      lineEntries: isEditing
        ? current.lineEntries
        : createAutoDisbursementLineEntries(nextTransaction),
      attachments:
        current.attachments.length > 0
          ? current.attachments
          : createAttachmentPlaceholders(nextTransaction),
    }));
    setErrors((current) => ({ ...current, transactionId: undefined }));
  }

  function handleTransactionNumberChange(value: string) {
    setTransactionNumber(value);

    if (isEditing) {
      return;
    }

    const nextTransaction = transactions.find(
      (currentTransaction) => currentTransaction.transactionNo === value.trim(),
    );

    syncTransaction(nextTransaction);
  }

  function handleProceedFromDetails() {
    const nextErrors = validateDisbursementVoucherDetails(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setActiveTab("cash-disbursement");
      return;
    }

    if (values.attachments.length === 0 && selectedTransaction) {
      updateField("attachments", createAttachmentPlaceholders(selectedTransaction));
    }

    if (values.lineEntries.length === 0 && selectedTransaction) {
      updateField("lineEntries", createAutoDisbursementLineEntries(selectedTransaction));
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

  function handleFinalSave() {
    const detailsErrors = validateDisbursementVoucherDetails(values);
    const entryErrors = validateDisbursementVoucherEntries(values);
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(
        detailsErrors.transactionId || detailsErrors.amount ? "details" : "entries",
      );
      return;
    }

    onSave(values);
    onClose();
  }

  return (
    <ModuleDrawer
      isOpen={isOpen}
      maxWidthClassName="max-w-6xl"
      eyebrow={isEditing ? "Edit disbursement voucher" : "New disbursement voucher"}
      title={isEditing ? values.voucherNo : "Disbursement Voucher"}
      description="Create the voucher details, continue to accounting entries, then review everything before saving."
      onClose={onClose}
      footer={
        <DrawerFooter
          isEditing={isEditing}
          step={step}
          onBack={
            step === "entries"
              ? () => setStep("details")
              : step === "review"
                ? () => setStep("entries")
                : undefined
          }
          onClose={onClose}
          onProceed={
            step === "details"
              ? handleProceedFromDetails
              : step === "entries"
                ? handleProceedFromEntries
                : handleFinalSave
          }
        />
      }
    >
      <DrawerStepper step={step} />

      {step === "details" ? (
        <>
          <div className="border-b border-darknavy/10 px-6 pt-4">
            <div className="flex items-end gap-1">
              <DrawerTabButton
                isActive={activeTab === "cash-disbursement"}
                label="Cash Disbursement"
                onClick={() => setActiveTab("cash-disbursement")}
              />
              <DrawerTabButton
                isActive={activeTab === "file-attachment"}
                label="File Attachment"
                onClick={() => setActiveTab("file-attachment")}
              />
            </div>
          </div>

          {activeTab === "cash-disbursement" ? (
            <DetailsTab
              errors={errors}
              isEditing={isEditing}
              matchedTransaction={matchedTransaction}
              paymentTypeOptions={activePaymentTypeOptions}
              transactionNumber={transactionNumber}
              transactions={transactions}
              values={values}
              onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
              onTransactionNumberChange={handleTransactionNumberChange}
              onUpdateField={updateField}
            />
          ) : (
            <AttachmentsTab values={values} />
          )}
        </>
      ) : null}

      {step === "entries" ? (
        <EntriesStep
          entryDraft={entryDraft}
          entries={values.lineEntries}
          errors={errors}
          isBalanced={isBalanced}
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          onAddEntry={handleAddEntry}
          onApplyAutoEntries={handleApplyAutoEntries}
          onDraftChange={setEntryDraft}
          onRemoveEntry={handleRemoveEntry}
        />
      ) : null}

      {step === "review" ? (
        <ReviewStep
          selectedTransaction={selectedTransaction}
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          values={values}
          onEditEntries={() => setStep("entries")}
        />
      ) : null}

      <AppPaymentTypeDialog
        isOpen={isPaymentTypeDialogOpen}
        records={paymentTypeRecords}
        onClose={() => setIsPaymentTypeDialogOpen(false)}
        onRecordsChange={setPaymentTypeRecords}
        onSelect={(value) => {
          updateField("paymentMethod", value);
          setIsPaymentTypeDialogOpen(false);
        }}
      />
    </ModuleDrawer>
  );
}

function DrawerStepper({ step }: { step: WorkflowStep }) {
  const steps: Array<{ id: WorkflowStep; label: string }> = [
    { id: "details", label: "New Voucher" },
    { id: "entries", label: "Accounting Entries" },
    { id: "review", label: "Preview" },
  ];

  return (
    <div className="border-b border-darknavy/10 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((currentStep, index) => {
          const isActive = currentStep.id === step;
          const isComplete = steps.findIndex((item) => item.id === step) > index;

          return (
            <div key={currentStep.id} className="flex items-center gap-3">
              <div
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-xs font-semibold ${
                  isActive
                    ? "bg-darknavy text-white"
                    : isComplete
                      ? "bg-citron/35 text-darknavy"
                      : "bg-darknavy/8 text-darknavy/55"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm font-medium text-darknavy/72">
                {currentStep.label}
              </span>
              {index < steps.length - 1 ? (
                <div className="h-px w-8 bg-darknavy/12" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailsTab({
  errors,
  isEditing,
  matchedTransaction,
  paymentTypeOptions,
  transactionNumber,
  transactions,
  values,
  onOpenPaymentTypeDialog,
  onTransactionNumberChange,
  onUpdateField,
}: {
  errors: DisbursementVoucherFormErrors;
  isEditing: boolean;
  matchedTransaction?: DisbursementTransactionRecord;
  paymentTypeOptions: DisbursementPaymentMethod[];
  transactionNumber: string;
  transactions: DisbursementTransactionRecord[];
  values: DisbursementVoucherFormValues;
  onOpenPaymentTypeDialog: () => void;
  onTransactionNumberChange: (value: string) => void;
  onUpdateField: <TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) => void;
}) {
  const availablePaymentTypeOptions = useMemo(() => {
    if (
      values.paymentMethod &&
      !paymentTypeOptions.includes(values.paymentMethod as DisbursementPaymentMethod)
    ) {
      return [values.paymentMethod as DisbursementPaymentMethod, ...paymentTypeOptions];
    }

    return paymentTypeOptions;
  }, [paymentTypeOptions, values.paymentMethod]);

  return (
    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_0.72fr]">
      <div className="grid gap-4">
        <FieldShell error={errors.paymentMethod} label="Payment Type : *">
          <ActionField
            actionLabel="Add"
            onAction={onOpenPaymentTypeDialog}
            control={
              <select
                value={values.paymentMethod}
                onChange={(event) =>
                  onUpdateField(
                    "paymentMethod",
                    event.target.value as DisbursementPaymentMethod | "",
                  )
                }
                className={FieldClassName}
              >
                <option value="">--Select Payment Type--</option>
                {availablePaymentTypeOptions.map((paymentType) => (
                  <option key={paymentType} value={paymentType}>
                    {paymentType}
                  </option>
                ))}
              </select>
            }
          />
        </FieldShell>

        <FieldShell error={errors.vceCode} label="VCECode : *">
          <input
            value={values.vceCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.vceName} label="VCEName : *">
          <ActionField
            actionLabel="Add"
            onAction={() => undefined}
            control={
              <input
                value={values.vceName}
                onChange={(event) => onUpdateField("vceName", event.target.value)}
                className={FieldClassName}
              />
            }
          />
        </FieldShell>

        <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
          <FieldShell label="Currency :">
            <select
              value={values.currency}
              onChange={(event) =>
                onUpdateField("currency", event.target.value as VoucherCurrency)
              }
              className={FieldClassName}
            >
              <option value="PHP">PHP</option>
              <option value="USD">USD</option>
            </select>
          </FieldShell>
          <FieldShell label="FX Rate :">
            <input
              value={values.fxRate}
              onChange={(event) => onUpdateField("fxRate", event.target.value)}
              className={`${FieldClassName} text-right`}
            />
          </FieldShell>
        </div>

        <FieldShell error={errors.amount} label="Amount :">
          <ActionField
            actionLabel="Tax"
            onAction={() => undefined}
            control={
              <input
                value={values.amount}
                onChange={(event) => onUpdateField("amount", event.target.value)}
                className={`${FieldClassName} text-right`}
              />
            }
          />
        </FieldShell>

        <FieldShell label="Remarks :">
          <textarea
            value={values.remarks}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${FieldClassName} min-h-24 py-3`}
          />
        </FieldShell>

        <FieldShell error={errors.disbursementType} label="Disbursement Type :">
          <ActionField
            actionLabel="Add"
            onAction={() => undefined}
            control={
              <select
                value={values.disbursementType}
                onChange={(event) =>
                  onUpdateField(
                    "disbursementType",
                    event.target.value as DisbursementType | "",
                  )
                }
                className={FieldClassName}
              >
                <option value="">--Select Disbursement Type--</option>
                <option value="Vendor Payment">Vendor Payment</option>
                <option value="Operating Expense">Operating Expense</option>
                <option value="Reimbursement">Reimbursement</option>
                <option value="Capital Expenditure">Capital Expenditure</option>
              </select>
            }
          />
        </FieldShell>
      </div>

      <div className="grid gap-4">
        <FieldShell error={errors.transactionId} label="Trans No. : *">
          <>
            <input
              list="disbursement-voucher-transaction-nos"
              value={transactionNumber}
              readOnly
              className={ReadOnlyFieldClassName}
            />
            <datalist id="disbursement-voucher-transaction-nos">
              {transactions.map((currentTransaction) => (
                <option
                  key={currentTransaction.id}
                  value={currentTransaction.transactionNo}
                />
              ))}
            </datalist>
            {!isEditing && transactionNumber.trim() && !matchedTransaction ? (
              <span className="text-xs text-coralpink">
                Select a valid transaction number from the existing records.
              </span>
            ) : null}
          </>
        </FieldShell>

        <FieldShell error={errors.voucherDate} label="Document Date :">
          <input
            type="date"
            value={values.voucherDate}
            onChange={(event) => onUpdateField("voucherDate", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.voucherReferenceNo} label="Ref No. :">
          <input
            value={values.voucherReferenceNo}
            onChange={(event) =>
              onUpdateField("voucherReferenceNo", event.target.value)
            }
            className={FieldClassName}
          />
        </FieldShell>

        <FieldShell label="Status :">
          <input value={values.status} readOnly className={ReadOnlyFieldClassName} />
        </FieldShell>

        <FieldShell error={errors.costCenter} label="ProjectRef :">
          <input
            value={values.costCenter}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.invoiceReferenceNo} label="Importation Ref No :">
          <input
            value={values.invoiceReferenceNo}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
      </div>
    </div>
  );
}

function AttachmentsTab({ values }: { values: DisbursementVoucherFormValues }) {
  return (
    <div className="px-6 py-6">
      <div className="rounded-2xl border border-darknavy/10 bg-offwhite/55 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-skyblue/15 text-darknavy">
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-darknavy">File attachments</p>
            <p className="text-sm text-darknavy/58">
              Supporting files stay grouped with the voucher entry.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {values.attachments.length > 0 ? (
            values.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-xl border border-darknavy/10 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-darknavy">
                  {attachment.name}
                </span>
                <span className="text-xs text-darknavy/50">
                  {attachment.sizeLabel}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-darknavy/16 bg-white px-4 py-8 text-center text-sm text-darknavy/55">
              No attachments yet. Attachments will follow the selected transaction
              or can be added later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntriesStep({
  entryDraft,
  entries,
  errors,
  isBalanced,
  totalCredit,
  totalDebit,
  onAddEntry,
  onApplyAutoEntries,
  onDraftChange,
  onRemoveEntry,
}: {
  entryDraft: DisbursementVoucherEntryDraft;
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isBalanced: boolean;
  totalCredit: number;
  totalDebit: number;
  onAddEntry: () => void;
  onApplyAutoEntries: () => void;
  onDraftChange: (draft: DisbursementVoucherEntryDraft) => void;
  onRemoveEntry: (entryId: string) => void;
}) {
  return (
    <section className="p-6">
      <div className="rounded-[24px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]">
        <div className="border-b border-darknavy/8 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
                Accounting Entries
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-darknavy">
                Encode journal lines before saving
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-darknavy/58">
                After the voucher details, continue directly into journal lines,
                then move to the final preview once the entries are balanced.
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
              Load the default debit and credit entries from the selected
              transaction.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-[20px] border border-darknavy/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Particulars</th>
                    <th className="px-4 py-3">Debit</th>
                    <th className="px-4 py-3">Credit</th>
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
                        className={`${EntryFieldClassName} bg-white`}
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
                        className={`${EntryFieldClassName} bg-white`}
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
                        className={`${EntryFieldClassName} bg-white`}
                        placeholder="Describe the accounting line"
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
                        className={`${EntryFieldClassName} bg-white text-right`}
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
                        className={`${EntryFieldClassName} bg-white text-right`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={onAddEntry}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Add Line
                      </button>
                    </td>
                  </tr>

                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-darknavy/8 align-top">
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {entry.accountCode}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/72">
                        {entry.accountName}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/72">
                        {entry.particulars}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-darknavy/72">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-darknavy/72">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveEntry(entry.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-coralpink transition hover:bg-coralpink/12"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {errors.entryDraft ? (
            <p className="mt-4 text-sm font-medium text-coralpink">
              {errors.entryDraft}
            </p>
          ) : null}

          {errors.lineEntries ? (
            <p className="mt-4 text-sm font-medium text-coralpink">
              {errors.lineEntries}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryCard label="Total Debit" value={formatCurrency(totalDebit)} />
            <SummaryCard label="Total Credit" value={formatCurrency(totalCredit)} />
            <SummaryCard
              label="Variance"
              value={formatCurrency(Math.abs(totalDebit - totalCredit))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewStep({
  selectedTransaction,
  totalCredit,
  totalDebit,
  values,
  onEditEntries,
}: {
  selectedTransaction?: DisbursementTransactionRecord;
  totalCredit: number;
  totalDebit: number;
  values: DisbursementVoucherFormValues;
  onEditEntries: () => void;
}) {
  return (
    <section className="grid gap-5 p-6 xl:grid-cols-[0.82fr_1.18fr]">
      <ReviewCardShell
        eyebrow="Voucher Preview"
        title="New voucher summary"
        description="Review the encoded disbursement details before the final save."
      >
        <div className="grid gap-3">
          <InfoLine label="Trans No." value={selectedTransaction?.transactionNo ?? "-"} />
          <InfoLine label="Voucher No." value={values.voucherNo} />
          <InfoLine label="Document Date" value={formatDateLabel(values.voucherDate)} />
          <InfoLine label="Payment Type" value={values.paymentMethod || "-"} />
          <InfoLine label="Disbursement Type" value={values.disbursementType || "-"} />
          <InfoLine label="VCE Code" value={values.vceCode} />
          <InfoLine label="VCE Name" value={values.vceName} />
          <InfoLine label="ProjectRef" value={values.costCenter} />
          <InfoLine label="Importation Ref No." value={values.invoiceReferenceNo || "-"} />
          <InfoLine label="Amount" value={formatCurrency(Number(values.amount || 0))} />
          <InfoLine label="Remarks" value={values.remarks || "-"} />
        </div>
      </ReviewCardShell>

      <ReviewCardShell
        eyebrow="Accounting Preview"
        title="Accounting entries review"
        description="Confirm the journal lines and totals before posting this new voucher."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-darknavy/58">
            {values.lineEntries.length} accounting entries prepared.
          </p>
          <button
            type="button"
            onClick={onEditEntries}
            className="text-sm font-semibold text-skyblue"
          >
            Edit Entries
          </button>
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
                  <p className="mt-1 text-sm text-darknavy/58">{entry.particulars}</p>
                </div>
                <div className="text-right text-sm font-semibold text-darknavy">
                  <p>{entry.debit > 0 ? `DR ${formatCurrency(entry.debit)}` : "-"}</p>
                  <p>{entry.credit > 0 ? `CR ${formatCurrency(entry.credit)}` : "-"}</p>
                </div>
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
            <span className="font-semibold">Voucher amount</span>
            <span className="text-lg font-semibold">
              {formatCurrency(Number(values.amount || 0))}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-[18px] border border-darknavy/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
            Attachments
          </p>
          <div className="mt-3 grid gap-3">
            {values.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-xl border border-darknavy/10 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-darknavy">
                    {attachment.name}
                  </span>
                </div>
                <span className="text-xs text-darknavy/50">{attachment.sizeLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </ReviewCardShell>
    </section>
  );
}

function DrawerFooter({
  isEditing,
  step,
  onBack,
  onClose,
  onProceed,
}: {
  isEditing: boolean;
  step: WorkflowStep;
  onBack?: () => void;
  onClose: () => void;
  onProceed: () => void;
}) {
  const primaryLabel =
    step === "details"
      ? "Proceed to Accounting Entries"
      : step === "entries"
        ? "Proceed to Preview"
        : isEditing
          ? "Save Changes"
          : "Save Voucher";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35"
          >
            Back
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

function DrawerTabButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-t-lg border border-b-0 px-4 py-2 text-sm transition ${
        isActive
          ? "border-darknavy/12 bg-white font-medium text-darknavy"
          : "border-transparent bg-transparent text-blue-600 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

function ActionField({
  actionLabel,
  control,
  onAction,
}: {
  actionLabel: string;
  control: ReactNode;
  onAction: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">{control}</div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-md bg-blue-500 px-3 text-sm font-medium text-white transition hover:bg-blue-600"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}

function FieldShell({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-darknavy/82">{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-coralpink">{error}</span>
      ) : null}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-darknavy/10 bg-offwhite/55 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-darknavy">{value}</p>
    </div>
  );
}

function ReviewCardShell({
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
    <section className="rounded-[28px] border border-darknavy/10 bg-white p-5 shadow-[0_18px_60px_rgba(33,39,56,0.08)] lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-darknavy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/38">
        {label}
      </dt>
      <dd className="text-sm font-medium text-darknavy">{value}</dd>
    </div>
  );
}

const FieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-offwhite/80 px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/40 focus:bg-white";

const ReadOnlyFieldClassName =
  "h-11 w-full rounded-md border border-darknavy/12 bg-darknavy/[0.04] px-3 text-sm text-darknavy/70 outline-none";

const EntryFieldClassName =
  "h-11 w-full rounded-xl border border-darknavy/12 px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/40";
