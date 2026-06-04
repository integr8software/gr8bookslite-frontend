"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, FileText, Paperclip, Plus, X } from "lucide-react";
import {
  DisbursementVoucherInitialEntryDraft,
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
  applyCopyFromRecordToDisbursementVoucherForm,
  createAttachmentPlaceholders,
  createAutoDisbursementLineEntries,
  createDisbursementVoucherFormValues,
  formatCurrency,
  formatDateLabel,
  formatTaxRateSummary,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
  AppPaymentTypeDialog,
  InitialAppPaymentTypeRecords,
  type AppPaymentTypeRecord,
} from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog";
import {
  AppVceDialog,
  mapPartyRecordToVceValue,
} from "@/app/src/ui/shared/transaction-setup/AppVceDialog";
import {
  AppDisbursementTypeDialog,
  InitialAppDisbursementTypeRecords,
  type AppDisbursementTypeRecord,
} from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import {
  AppTaxRateDialog,
  type AppTaxRateDialogValue,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import {
  writeAccountingGridSession,
  type DisbursementVoucherAccountingGridSession,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/AccountingGridSession";
import { DisbursementVoucherCopyFromDialog } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherCopyFromDialog";
import type {
  DisbursementLineEntry,
  DisbursementPaymentMethod,
  DisbursementTransactionRecord,
  DisbursementType,
  DisbursementVoucherCopySource,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
  VoucherCurrency,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PartyType } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

type DrawerMode = "add" | "edit";
type DrawerTab =
  | "cash-disbursement"
  | "payment-details"
  | "file-attachment";

type DisbursementVoucherDrawerProps = {
  isOpen: boolean;
  mode: DrawerMode;
  resumeState?: DisbursementVoucherAccountingGridSession | null;
  transaction?: DisbursementTransactionRecord;
  transactions: DisbursementTransactionRecord[];
  voucher?: DisbursementVoucherRecord;
  onClose: () => void;
  onSave: (values: DisbursementVoucherFormValues) => void;
};

export function DisbursementVoucherDrawer({
  isOpen,
  mode,
  resumeState,
  transaction,
  transactions,
  voucher,
  onClose,
  onSave,
}: DisbursementVoucherDrawerProps) {
  return (
    <DrawerPanel
      key={`${mode}-${resumeState?.values.transactionId ?? transaction?.id ?? "blank"}-${resumeState?.values.voucherNo ?? voucher?.id ?? "new"}`}
      isOpen={isOpen}
      mode={mode}
      resumeState={resumeState}
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
  resumeState,
  transaction,
  transactions,
  voucher,
  onClose,
  onSave,
}: DisbursementVoucherDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DrawerTab>("cash-disbursement");
  const [step, setStep] = useState<WorkflowStep>(
    resumeState?.returnStep === "entries"
      ? "details"
      : (resumeState?.returnStep ?? "details"),
  );
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const [isVceDialogOpen, setIsVceDialogOpen] = useState(false);
  const [isVoucherTaxDialogOpen, setIsVoucherTaxDialogOpen] = useState(false);
  const [isDisbursementTypeDialogOpen, setIsDisbursementTypeDialogOpen] =
    useState(false);
  const [isCopyFromMenuOpen, setIsCopyFromMenuOpen] = useState(false);
  const [isCopyFromDialogOpen, setIsCopyFromDialogOpen] = useState(false);
  const [copyFromSource, setCopyFromSource] =
    useState<DisbursementVoucherCopySource>("Accounts Payable Voucher");
  const [paymentTypeRecords, setPaymentTypeRecords] = useState<
    AppPaymentTypeRecord[]
  >(InitialAppPaymentTypeRecords);
  const [disbursementTypeRecords, setDisbursementTypeRecords] = useState<
    AppDisbursementTypeRecord[]
  >(InitialAppDisbursementTypeRecords);
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    resumeState?.values ??
      createDisbursementVoucherFormValues(transaction, voucher),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [entryDraft, setEntryDraft] = useState<DisbursementVoucherEntryDraft>(
    resumeState?.entryDraft ?? DisbursementVoucherInitialEntryDraft,
  );
  const isEditing = mode === "edit";
  const selectedTransaction = useMemo(
    () =>
      transactions.find(
        (currentTransaction) => currentTransaction.id === values.transactionId,
      ),
    [transactions, values.transactionId],
  );
  const transactionNumber = selectedTransaction?.transactionNo ?? "";
  const matchedTransaction = selectedTransaction;
  const activePaymentTypeOptions = useMemo(
    () =>
      paymentTypeRecords
        .filter((record) => record.status === "Active")
        .map((record) => record.paymentType),
    [paymentTypeRecords],
  );
  const selectedPaymentTypeRecord = useMemo(
    () =>
      paymentTypeRecords.find(
        (record) => record.paymentType === values.paymentMethod,
      ) ?? null,
    [paymentTypeRecords, values.paymentMethod],
  );
  const requiresPaymentDetailsTab = Boolean(selectedPaymentTypeRecord?.withBank);
  const resolvedActiveTab =
    !requiresPaymentDetailsTab && activeTab === "payment-details"
      ? "cash-disbursement"
      : activeTab;
  const totalDebit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0),
    [values.lineEntries],
  );
  const totalCredit = useMemo(
    () => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0),
    [values.lineEntries],
  );
  function updateField<TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleProceedFromDetails() {
    const nextErrors = validateDisbursementVoucherDetails(values);
    const selectedDisbursementTypeRecord = findDisbursementTypeRecord(
      disbursementTypeRecords,
      values.disbursementType,
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setActiveTab("cash-disbursement");
      return;
    }

    if (values.attachments.length === 0) {
      updateField("attachments", createAttachmentPlaceholders());
    }

    if (values.lineEntries.length === 0 && selectedTransaction) {
      updateField(
        "lineEntries",
        applyDisbursementTypeRecordToLineEntries(
          createAutoDisbursementLineEntries(selectedTransaction),
          selectedDisbursementTypeRecord,
        ),
      );
    }

    if (selectedDisbursementTypeRecord) {
      setEntryDraft((current) =>
        applyDisbursementTypeRecordToEntryDraft(
          current,
          selectedDisbursementTypeRecord,
        ),
      );
    }

    handleOpenGridView();
  }

  function handleFinalSave() {
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

    onSave(values);
    onClose();
  }

  function openVoucherTaxDialog() {
    setIsVoucherTaxDialogOpen(true);
  }

  function handleOpenCopyFrom(source: DisbursementVoucherCopySource) {
    setCopyFromSource(source);
    setIsCopyFromDialogOpen(true);
    setIsCopyFromMenuOpen(false);
  }

  function handleSelectCopyFromRecord(
    record: (typeof DisbursementVoucherCopyFromRecords)[number],
  ) {
    setValues((current) =>
      applyCopyFromRecordToDisbursementVoucherForm(current, record),
    );
    setErrors({});
    setActiveTab("cash-disbursement");
  }

  function handleSaveVoucherTax(nextValue: AppTaxRateDialogValue) {
    updateField("taxRate", nextValue.taxRate);
    updateField("taxDetails", nextValue.taxDetails);
    setIsVoucherTaxDialogOpen(false);
  }

  function handleAmountChange(nextAmount: string) {
    updateField("amount", nextAmount);
    updateField(
      "taxDetails",
      syncTaxDetailsAmount(
        values.taxDetails,
        Number(nextAmount || 0),
        values.taxRate,
      ),
    );
  }

  function handleOpenGridView() {
    writeAccountingGridSession({
      entryDraft,
      mode,
      returnStep: "entries",
      values,
    });
    router.push("/cash-disbursement/disbursement-voucher/accounting-grid");
  }

  return (
    <ModuleDrawer
      isOpen={isOpen}
      maxWidthClassName="max-w-6xl"
      eyebrow={
        isEditing ? "Edit disbursement voucher" : "New disbursement voucher"
      }
      title={isEditing ? values.voucherNo : "Disbursement Voucher"}
      description="Create the voucher details, continue to accounting entries, then review everything before saving."
      actions={
        <CopyFromMenu
          isOpen={isCopyFromMenuOpen}
          onOpenSource={handleOpenCopyFrom}
          onToggle={() => setIsCopyFromMenuOpen((current) => !current)}
        />
      }
      onClose={onClose}
      footer={
        step === "entries" ? undefined : (
          <DrawerFooter
            isEditing={isEditing}
            step={step}
            onBack={
              step === "review"
                ? () => setStep("entries")
                : undefined
            }
            onClose={onClose}
            onProceed={
              step === "details" ? handleProceedFromDetails : handleFinalSave
            }
          />
        )
      }
    >
      {step === "details" ? (
        <>
          <div className="border-b border-darknavy/10 px-6 pt-4">
            <div className="flex items-end gap-1">
              <DrawerTabButton
                isActive={resolvedActiveTab === "cash-disbursement"}
                label="Cash Disbursement"
                onClick={() => setActiveTab("cash-disbursement")}
              />
              {requiresPaymentDetailsTab ? (
                <DrawerTabButton
                  isActive={resolvedActiveTab === "payment-details"}
                  label="Payment Details"
                  onClick={() => setActiveTab("payment-details")}
                />
              ) : null}
              <DrawerTabButton
                isActive={resolvedActiveTab === "file-attachment"}
                label="File Attachment"
                onClick={() => setActiveTab("file-attachment")}
              />
            </div>
          </div>

          {resolvedActiveTab === "cash-disbursement" ? (
            <DetailsTab
              errors={errors}
              isEditing={isEditing}
              matchedTransaction={matchedTransaction}
              paymentTypeOptions={activePaymentTypeOptions}
              disbursementTypeOptions={getActiveDisbursementTypeOptions(
                disbursementTypeRecords,
              )}
              transactionNumber={transactionNumber}
              transactions={transactions}
              values={values}
              onAmountChange={handleAmountChange}
              onOpenDisbursementTypeDialog={() =>
                setIsDisbursementTypeDialogOpen(true)
              }
              onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
              onOpenVoucherTaxDialog={openVoucherTaxDialog}
              onOpenVceDialog={() => setIsVceDialogOpen(true)}
              onUpdateField={updateField}
            />
          ) : resolvedActiveTab === "payment-details" ? (
            <PaymentDetailsTab
              paymentMethod={values.paymentMethod}
              paymentDetails={values.paymentDetails}
              withBank={selectedPaymentTypeRecord?.withBank ?? false}
              onUpdateField={updateField}
            />
          ) : (
            <AttachmentsTab values={values} />
          )}
        </>
      ) : null}

      {step === "review" ? (
        <ReviewStep
          selectedTransaction={selectedTransaction}
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          values={values}
          onEditEntries={handleOpenGridView}
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

      <AppVceDialog
        isOpen={isVceDialogOpen}
        suggestedPartyType={getSuggestedPartyType(values.disbursementType)}
        onClose={() => setIsVceDialogOpen(false)}
        onSelect={(record) => {
          const nextVce = mapPartyRecordToVceValue(record);
          updateField("vceCode", nextVce.vceCode);
          updateField("vceName", nextVce.vceName);
          setIsVceDialogOpen(false);
        }}
      />

      <AppTaxRateDialog
        isOpen={isVoucherTaxDialogOpen}
        title="Voucher Tax"
        value={{
          taxRate: values.taxRate,
          taxDetails: syncTaxDetailsAmount(
            values.taxDetails,
            Number(values.amount || 0),
            values.taxRate,
          ),
        }}
        onClose={() => setIsVoucherTaxDialogOpen(false)}
        onSave={handleSaveVoucherTax}
      />

      <AppDisbursementTypeDialog
        isOpen={isDisbursementTypeDialogOpen}
        records={disbursementTypeRecords}
        onClose={() => setIsDisbursementTypeDialogOpen(false)}
        onRecordsChange={setDisbursementTypeRecords}
        onSelect={(value) => {
          updateField("disbursementType", value);
          setIsDisbursementTypeDialogOpen(false);
        }}
      />

      <DisbursementVoucherCopyFromDialog
        isOpen={isCopyFromDialogOpen}
        records={DisbursementVoucherCopyFromRecords}
        source={copyFromSource}
        onClose={() => setIsCopyFromDialogOpen(false)}
        onSelect={handleSelectCopyFromRecord}
      />
    </ModuleDrawer>
  );
}

function CopyFromMenu({
  isOpen,
  onOpenSource,
  onToggle,
}: {
  isOpen: boolean;
  onOpenSource: (source: DisbursementVoucherCopySource) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
      >
        Copy From
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-[0_18px_40px_rgba(33,39,56,0.12)]">
          {DisbursementVoucherCopySources.map((source, index) => (
            <button
              key={source}
              type="button"
              onClick={() => onOpenSource(source)}
              className={`w-full px-4 py-3 text-left text-sm text-darknavy transition hover:bg-skyblue/10 ${
                index < DisbursementVoucherCopySources.length - 1
                  ? "border-b border-darknavy/8"
                  : ""
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DetailsTab({
  errors,
  isEditing,
  matchedTransaction,
  disbursementTypeOptions,
  paymentTypeOptions,
  transactionNumber,
  transactions,
  values,
  onAmountChange,
  onOpenDisbursementTypeDialog,
  onOpenPaymentTypeDialog,
  onOpenVoucherTaxDialog,
  onOpenVceDialog,
  onUpdateField,
}: {
  errors: DisbursementVoucherFormErrors;
  isEditing: boolean;
  matchedTransaction?: DisbursementTransactionRecord;
  disbursementTypeOptions: DisbursementType[];
  paymentTypeOptions: DisbursementPaymentMethod[];
  transactionNumber: string;
  transactions: DisbursementTransactionRecord[];
  values: DisbursementVoucherFormValues;
  onAmountChange: (value: string) => void;
  onOpenDisbursementTypeDialog: () => void;
  onOpenPaymentTypeDialog: () => void;
  onOpenVoucherTaxDialog: () => void;
  onOpenVceDialog: () => void;
  onUpdateField: <TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) => void;
}) {
  const availablePaymentTypeOptions = useMemo(() => {
    if (
      values.paymentMethod &&
      !paymentTypeOptions.includes(
        values.paymentMethod as DisbursementPaymentMethod,
      )
    ) {
      return [
        values.paymentMethod as DisbursementPaymentMethod,
        ...paymentTypeOptions,
      ];
    }

    return paymentTypeOptions;
  }, [paymentTypeOptions, values.paymentMethod]);
  const displayedTransactionNumber =
    transactionNumber || "Auto-generated on save";

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
                className={`${FieldClassName} app-select-control`}
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

        <FieldShell error={errors.vceCode} label="Party Code : *">
          <input
            value={values.vceCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.vceName} label="Party Name : *">
          <ActionField
            actionLabel="Add"
            onAction={onOpenVceDialog}
            control={
              <input
                value={values.vceName}
                onChange={(event) =>
                  onUpdateField("vceName", event.target.value)
                }
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
              className={`${FieldClassName} app-select-control`}
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
            onAction={onOpenVoucherTaxDialog}
            control={
              <input
                value={values.amount}
                onChange={(event) => onAmountChange(event.target.value)}
                className={`${FieldClassName} text-right`}
              />
            }
          />
        </FieldShell>
        <p className="-mt-2 text-xs font-medium text-darknavy/55">
          {formatTaxRateSummary(values.taxDetails)}
        </p>

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
            onAction={onOpenDisbursementTypeDialog}
            control={
              <select
                value={values.disbursementType}
                onChange={(event) =>
                  onUpdateField(
                    "disbursementType",
                    event.target.value as DisbursementType | "",
                  )
                }
                className={`${FieldClassName} app-select-control`}
              >
                <option value="">--Select Disbursement Type--</option>
                {disbursementTypeOptions.map((disbursementType) => (
                  <option key={disbursementType} value={disbursementType}>
                    {disbursementType}
                  </option>
                ))}
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
              value={displayedTransactionNumber}
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

        <FieldShell label="Voucher No. :">
          <input
            value={values.voucherNo}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.voucherDate} label="Document Date :">
          <input
            type="date"
            value={values.voucherDate}
            onChange={(event) =>
              onUpdateField("voucherDate", event.target.value)
            }
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
          <input
            value={values.status}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell error={errors.costCenter} label="ProjectRef :">
          <input
            value={values.costCenter}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>

        <FieldShell
          error={errors.invoiceReferenceNo}
          label="Importation Ref No :"
        >
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
            <p className="text-sm font-semibold text-darknavy">
              File attachments
            </p>
            <p className="text-sm text-darknavy/58">
              Supporting files stay grouped with the voucher entry.
            </p>
          </div>
        </div>

        <VoucherAttachmentList
          attachments={values.attachments}
          emptyMessage="No attachments yet. Attachments will follow the selected transaction or can be added later."
          variant="tab"
        />
      </div>
    </div>
  );
}

function PaymentDetailsTab({
  paymentDetails,
  paymentMethod,
  withBank,
  onUpdateField,
}: {
  paymentDetails: DisbursementVoucherFormValues["paymentDetails"];
  paymentMethod: DisbursementVoucherFormValues["paymentMethod"];
  withBank: boolean;
  onUpdateField: <TKey extends keyof DisbursementVoucherFormValues>(
    field: TKey,
    value: DisbursementVoucherFormValues[TKey],
  ) => void;
}) {
  const isCheckPayment = paymentMethod === "Check" || paymentMethod === "Manager's Check";

  function updatePaymentDetailField(
    field: keyof DisbursementVoucherFormValues["paymentDetails"],
    value: string,
  ) {
    onUpdateField("paymentDetails", {
      ...paymentDetails,
      [field]: value,
    });
  }

  return (
    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_0.72fr]">
      <section className="rounded-[24px] border border-darknavy/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
            Bank-Linked Payment
          </p>
          <h3 className="mt-2 text-xl font-semibold text-darknavy">
            {paymentMethod || "Payment"} details
          </h3>
          <p className="mt-2 text-sm leading-6 text-darknavy/58">
            Because this payment type is marked as bank-linked, you can capture the bank and release details here before moving to accounting entries.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <FieldShell label="Bank Name :">
            <input
              value={paymentDetails.bankName}
              onChange={(event) =>
                updatePaymentDetailField("bankName", event.target.value)
              }
              className={FieldClassName}
              placeholder="e.g. BDO Unibank"
            />
          </FieldShell>
          <FieldShell label="Bank Branch :">
            <input
              value={paymentDetails.bankBranch}
              onChange={(event) =>
                updatePaymentDetailField("bankBranch", event.target.value)
              }
              className={FieldClassName}
              placeholder="e.g. Makati Corporate Branch"
            />
          </FieldShell>
          <FieldShell label="Account Name :">
            <input
              value={paymentDetails.bankAccountName}
              onChange={(event) =>
                updatePaymentDetailField("bankAccountName", event.target.value)
              }
              className={FieldClassName}
              placeholder="Account holder name"
            />
          </FieldShell>
          <FieldShell label="Account No. :">
            <input
              value={paymentDetails.bankAccountNo}
              onChange={(event) =>
                updatePaymentDetailField("bankAccountNo", event.target.value)
              }
              className={FieldClassName}
              placeholder="Account number"
            />
          </FieldShell>
        </div>
      </section>

      <section className="rounded-[24px] border border-darknavy/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
            Release Details
          </p>
          <h3 className="mt-2 text-xl font-semibold text-darknavy">
            Payment reference
          </h3>
          <p className="mt-2 text-sm leading-6 text-darknavy/58">
            {isCheckPayment
              ? "Capture the check information and release schedule for this bank-backed payment."
              : "Capture the transfer or payment reference used by the bank-linked payment method."}
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          {isCheckPayment ? (
            <>
              <FieldShell label="Check No. :">
                <input
                  value={paymentDetails.checkNo}
                  onChange={(event) =>
                    updatePaymentDetailField("checkNo", event.target.value)
                  }
                  className={FieldClassName}
                  placeholder="Check number"
                />
              </FieldShell>
              <FieldShell label="Check Date :">
                <input
                  type="date"
                  value={paymentDetails.checkDate}
                  onChange={(event) =>
                    updatePaymentDetailField("checkDate", event.target.value)
                  }
                  className={FieldClassName}
                />
              </FieldShell>
            </>
          ) : null}

          <FieldShell label={isCheckPayment ? "Reference No. :" : "Payment Reference :"}>
            <input
              value={paymentDetails.paymentReferenceNo}
              onChange={(event) =>
                updatePaymentDetailField("paymentReferenceNo", event.target.value)
              }
              className={FieldClassName}
              placeholder={
                isCheckPayment
                  ? "Optional bank or clearing reference"
                  : "Transfer or payment reference"
              }
            />
          </FieldShell>

          <div className="rounded-[18px] border border-darknavy/10 bg-offwhite/55 px-4 py-4 text-sm text-darknavy/62">
            <p className="font-semibold text-darknavy">
              {withBank ? "Bank setup enabled" : "No bank setup"}
            </p>
            <p className="mt-1">
              Payment types marked with bank can store account and release details here. Non-bank methods such as cash will not show this tab.
            </p>
          </div>
        </div>
      </section>
    </div>
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
    <section className="grid gap-5 p-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <ReviewCardShell
          eyebrow="Transaction Preview"
          title={selectedTransaction?.payee ?? (values.vceName || "Voucher Preview")}
          description="This panel shows the source transaction that the voucher workflow will use."
        >
          <div className="grid gap-5">
            <InfoLine
              label="Transaction No."
              value={selectedTransaction?.transactionNo ?? "-"}
            />
            <InfoLine
              label="Department"
              value={selectedTransaction?.department ?? "-"}
            />
            <InfoLine
              label="Requested By"
              value={selectedTransaction?.requestedBy ?? "-"}
            />
            <InfoLine
              label="Amount"
              value={formatCurrency(Number(values.amount || 0))}
            />
            <InfoLine
              label="Purpose"
              value={selectedTransaction?.purpose ?? (values.remarks || "-")}
            />
          </div>
        </ReviewCardShell>

        <ReviewCardShell
          eyebrow="Voucher Status"
          title={values.voucherNo}
          description="A linked voucher exists for this transaction and can be reviewed or edited."
        >
          <div className="grid gap-5">
            <InfoLine
              label="Voucher Date"
              value={formatDateLabel(values.voucherDate)}
            />
            <InfoLine label="Payment Method" value={values.paymentMethod || "-"} />
            <InfoLine label="Prepared By" value={values.preparedBy || "-"} />
            <InfoLine label="Status" value={values.status || "-"} />
            <InfoLine label="Remarks" value={values.remarks || "-"} />

            <div className="rounded-[18px] border border-darknavy/10 bg-offwhite/45 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-darknavy/45">
                Linked Voucher Amount
              </p>
              <p className="mt-2 text-3xl font-semibold text-darknavy">
                {formatCurrency(Number(values.amount || 0))}
              </p>
            </div>
          </div>
        </ReviewCardShell>
      </div>

      <ReviewCardShell
        eyebrow="Accounting Preview"
        title="Accounting entries review"
        description="Confirm the journal lines, totals, and attachments before the final save."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-darknavy/58">
            {values.lineEntries.length} accounting entries prepared.
          </p>
          <button
            type="button"
            onClick={onEditEntries}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryPreviewCard
            label="Total Debit"
            value={formatCurrency(totalDebit)}
          />
          <SummaryPreviewCard
            label="Total Credit"
            value={formatCurrency(totalCredit)}
          />
          <SummaryPreviewCard
            label="Variance"
            tone={Math.abs(totalDebit - totalCredit) < 0.001 ? "balanced" : "warning"}
            value={formatCurrency(Math.abs(totalDebit - totalCredit))}
          />
        </div>

        <VoucherAttachmentList
          attachments={values.attachments}
          emptyMessage="No attachments are linked to this voucher yet."
          variant="preview"
        />
      </ReviewCardShell>
    </section>
  );
}

function SummaryPreviewCard({
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

function VoucherAttachmentList({
  attachments,
  emptyMessage,
  variant,
}: {
  attachments: DisbursementVoucherFormValues["attachments"];
  emptyMessage: string;
  variant: "preview" | "tab";
}) {
  const [selectedAttachment, setSelectedAttachment] = useState<
    DisbursementVoucherFormValues["attachments"][number] | null
  >(null);

  return (
    <>
      <div
        className={
          variant === "preview"
            ? "mt-5 rounded-[18px] border border-darknavy/10 bg-white p-4"
            : "mt-5"
        }
      >
        {variant === "preview" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">
                Attachments
              </p>
              <p className="mt-1 text-xs text-darknavy/50">
                Review supporting files before final save.
              </p>
            </div>
            <span className="rounded-full border border-darknavy/10 bg-offwhite/45 px-3 py-1 text-xs font-semibold text-darknavy/55">
              {attachments.length} file{attachments.length === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}

        <div className={variant === "preview" ? "mt-3 grid gap-3" : "grid gap-3"}>
          {attachments.length > 0 ? (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex flex-col gap-3 rounded-xl border border-darknavy/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-darknavy">
                      {attachment.name}
                    </p>
                    <p className="mt-1 text-xs text-darknavy/50">
                      {attachment.sizeLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(attachment)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-skyblue/25 bg-skyblue/8 px-3 text-xs font-semibold text-skyblue transition hover:bg-skyblue/14"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-darknavy/16 bg-white px-4 py-8 text-center text-sm text-darknavy/55">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>

      <VoucherAttachmentDetailsDialog
        attachment={selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
      />
    </>
  );
}

function VoucherAttachmentDetailsDialog({
  attachment,
  onClose,
}: {
  attachment: DisbursementVoucherFormValues["attachments"][number] | null;
  onClose: () => void;
}) {
  if (!attachment) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-attachment-details-title"
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">
              Attachment
            </p>
            <h2
              id="voucher-attachment-details-title"
              className="mt-1 text-xl font-semibold text-darknavy"
            >
              File Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-darknavy/6 hover:text-darknavy"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-darknavy/10 bg-offwhite/45 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-darknavy">
                {attachment.name}
              </p>
              <p className="mt-1 text-xs text-darknavy/55">
                {attachment.sizeLabel}
              </p>
            </div>
          </div>
          <p className="rounded-xl border border-darknavy/10 bg-white px-4 py-3 text-sm leading-6 text-darknavy/60">
            This preview shows the attachment record linked to the voucher. File
            opening/downloading can be connected once real attachment storage is
            available.
          </p>
        </div>
        <div className="flex justify-end border-t border-darknavy/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/8"
          >
            Close
          </button>
        </div>
      </section>
    </div>
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
          className="theme-accent-contrast-text inline-flex h-11 items-center justify-center rounded-xl bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85"
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
          : "border-transparent bg-transparent text-skyblue hover:text-skyblue/80"
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
        className="theme-accent-contrast-text inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-md bg-skyblue px-3 text-sm font-medium transition hover:bg-skyblue/85"
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
  "app-theme-field h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:border-skyblue/40";

const ReadOnlyFieldClassName =
  "app-theme-field-readonly h-11 w-full rounded-md border px-3 text-sm outline-none";

function getSuggestedPartyType(
  disbursementType: DisbursementType | "",
): PartyType {
  if (disbursementType === "Reimbursement") {
    return "Employee";
  }

  if (disbursementType === "Operating Expense") {
    return "Vendor";
  }

  if (disbursementType === "Capital Expenditure") {
    return "Vendor";
  }

  return "Vendor";
}

function getActiveDisbursementTypeOptions(
  records: AppDisbursementTypeRecord[],
): DisbursementType[] {
  return records
    .filter((record) => record.status === "Active")
    .map((record) => record.description);
}

function findDisbursementTypeRecord(
  records: AppDisbursementTypeRecord[],
  disbursementType: DisbursementType | "",
) {
  if (!disbursementType) {
    return undefined;
  }

  return records.find((record) => record.description === disbursementType);
}

function applyDisbursementTypeRecordToEntryDraft(
  draft: DisbursementVoucherEntryDraft,
  record?: AppDisbursementTypeRecord,
) {
  if (!record?.accountCode && !record?.accountTitle) {
    return draft;
  }

  return {
    ...draft,
    accountCode: record.accountCode || draft.accountCode,
    accountName: record.accountTitle || draft.accountName,
  };
}

function applyDisbursementTypeRecordToLineEntries(
  entries: DisbursementLineEntry[],
  record?: AppDisbursementTypeRecord,
) {
  if (entries.length === 0 || (!record?.accountCode && !record?.accountTitle)) {
    return entries;
  }

  return entries.map((entry, index) =>
    index === 0
      ? {
          ...entry,
          accountCode: record.accountCode || entry.accountCode,
          accountName: record.accountTitle || entry.accountName,
        }
      : entry,
  );
}

