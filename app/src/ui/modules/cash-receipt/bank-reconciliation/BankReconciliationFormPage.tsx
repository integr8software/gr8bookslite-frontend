"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, RotateCw, Save, Upload } from "lucide-react";
import {
  BankReconciliationActionCopy,
  BankReconciliationHref,
  BankTemplateOptions,
} from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import { formatBankReconciliationAmount } from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { useBankReconciliationFormPage } from "@/app/src/hooks/modules/cash-receipt/bank-reconciliation/useBankReconciliationFormPage";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { BankReconciliationCheckingTable } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationCheckingTable";
import { BankReconciliationNotFound } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationNotFound";
import { isActiveStatus } from "@/app/src/utils/status.util";

const fieldClassName =
  "app-data-entry-field h-10 min-w-0 w-full rounded-md border border-darknavy/15 bg-white px-3 text-xs font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/50 focus:bg-white focus:ring-2 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const readOnlyFieldClassName = `${fieldClassName} !bg-darknavy/5 text-darknavy/70`;
const textareaClassName =
  "app-data-entry-field min-h-20 min-w-0 w-full resize-y rounded-md border border-darknavy/15 bg-white px-3 py-2 text-xs font-medium leading-5 text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/50 focus:bg-white focus:ring-2 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-white disabled:text-darknavy disabled:opacity-60";
const errorClassName = "mt-1 block text-xs font-semibold text-coralpink";

export function BankReconciliationFormPage() {
  const page = useBankReconciliationFormPage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { banks, refreshBanks, isRefreshing: isBanksRefreshing } =
    useBankMasterfileStore();

  const bankOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const active = banks
      .filter((b) => isActiveStatus(b.status))
      .map((b) => ({
        value: b.id,
        label: b.accountNumber,
        name: `${b.bankName} - ${b.branch}`,
        description: `${b.accountTitle} (${b.accountCode})`,
        selectedDetails: `${b.bankName} - ${b.branch} [${b.accountNumber}]`,
      }));

    if (
      page.values.bankId &&
      !active.some((opt) => opt.value === page.values.bankId)
    ) {
      active.push({
        value: page.values.bankId,
        label: page.values.bankId,
        name: page.values.bankName || page.values.bankId,
        description: "Current record bank value",
        selectedDetails: page.values.bankName || page.values.bankId,
      });
    }

    return active;
  }, [banks, page.values.bankId, page.values.bankName]);

  const copy = BankReconciliationActionCopy[page.mode];
  const title =
    page.mode === "view" && page.existingRecord
      ? `View Bank Reconciliation | ${page.existingRecord.brNo}`
      : page.mode === "edit" && page.existingRecord
        ? `Edit Bank Reconciliation | ${page.existingRecord.brNo}`
        : copy.title;

  if (page.needsRecord && !page.existingRecord) {
    return <BankReconciliationNotFound />;
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <ModuleHeader
          variant="panel"
          titleAs="h1"
          title={title}
          description={copy.description}
          eyebrow={page.values.brNo || "Bank Reconciliation"}
          actionsClassName="items-center gap-1"
          actions={
            <>
              <Link
                href={BankReconciliationHref}
                className={moduleHeaderActionClassNames.secondary}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
              {page.mode === "view" && page.existingRecord ? (
                <Link
                  href={`${BankReconciliationHref}/edit/${page.existingRecord.id}`}
                  className={moduleHeaderActionClassNames.primary}
                >
                  Edit
                </Link>
              ) : null}
              {!page.isReadonly && page.mode !== "view" ? (
                <>
                  {page.mode === "edit" ? (
                    <button
                      type="button"
                      className={moduleHeaderActionClassNames.danger}
                      onClick={() => page.setIsCancelDialogOpen(true)}
                    >
                      <Ban className="h-4 w-4" aria-hidden="true" />
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className={moduleHeaderActionClassNames.primary}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save
                  </button>
                </>
              ) : null}
            </>
          }
        />

        {/* Aligned 3-Column Header Section */}
        <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid min-w-0 gap-x-8 gap-y-4 xl:grid-cols-3">
            {/* Column 1: Bank Information & Remarks */}
            <div className="grid min-w-0 content-start gap-3">
              <FieldShell
                controlId="bank-recon-bank-id"
                label="Bank"
                error={page.errors.bankId}
                isRequired
              >
                <div className="flex items-center gap-1.5">
                  <AppAdvancedDropdown
                    id="bank-recon-bank-id"
                    className="flex-1 min-w-0"
                    value={page.values.bankId}
                    options={bankOptions}
                    placeholder="Select Bank"
                    searchPlaceholder="Search bank or account number..."
                    readOnly={page.isReadonly}
                    onChange={(val) => {
                      const selected = banks.find((b) => b.id === String(val));
                      page.selectBankAccount(selected ?? null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={refreshBanks}
                    disabled={isBanksRefreshing || page.isReadonly}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md bg-skyblue px-2.5 text-xs font-semibold text-white transition hover:bg-skyblue/90 disabled:opacity-50"
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 ${
                        isBanksRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
              </FieldShell>

              <TextField
                label="Account Code"
                name="accountCode"
                value={page.values.accountCode}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />

              <TextField
                label="Account Title"
                name="accountTitle"
                value={page.values.accountTitle}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />

              <TextareaField
                label="Remarks"
                name="remarks"
                value={page.values.remarks || ""}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
            </div>

            {/* Column 2: Balances, In-Transit Adjustments & Variance */}
            <div className="grid min-w-0 content-start gap-3">
              <TextField
                label="Bank Balance"
                name="bankBalance"
                type="number"
                step="0.01"
                value={String(page.values.bankBalance)}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
                inputClassName="text-right font-medium tabular-nums"
              />

              <TextField
                label="Adjustment Bank Balance"
                name="adjustedBankBalance"
                value={formatBankReconciliationAmount(
                  page.totals.adjustedBankBalance,
                )}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
                inputClassName="text-right font-semibold tabular-nums"
              />

              <TextField
                label="Book Balance"
                name="bookBalance"
                type="number"
                step="0.01"
                value={String(page.values.bookBalance)}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
                inputClassName="text-right font-medium tabular-nums"
              />

              <TextField
                label="Adjustment Book Balance"
                name="adjustedBookBalance"
                value={formatBankReconciliationAmount(
                  page.totals.adjustedBookBalance,
                )}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
                inputClassName="text-right font-semibold tabular-nums"
              />

              <TextField
                label="Outstanding Check"
                name="outstandingCheck"
                value={formatBankReconciliationAmount(
                  page.totals.outstandingCheck,
                )}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
                inputClassName="text-right font-medium tabular-nums"
              />

              <TextField
                label="Deposit in Transit"
                name="depositInTransit"
                value={formatBankReconciliationAmount(
                  page.totals.depositInTransit,
                )}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
                inputClassName="text-right font-medium tabular-nums"
              />

              <TextField
                label="Variance"
                name="variance"
                value={formatBankReconciliationAmount(page.totals.variance)}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
                inputClassName={`text-right font-bold tabular-nums ${
                  page.totals.variance === 0
                    ? "!text-emerald-700 !bg-emerald-50"
                    : "!text-coralpink !bg-coralpink/5"
                }`}
              />
            </div>

            {/* Column 3: Reference No, BR Date & Status */}
            <div className="grid min-w-0 content-start gap-3">
              <TextField
                label="BR No"
                name="brNo"
                value={page.values.brNo}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />

              <TextField
                label="BR Date"
                name="endingDate"
                type="date"
                value={page.values.endingDate}
                disabled={page.isReadonly}
                isRequired
                onChange={page.handleInputChange}
              />

              <TextField
                label="Status"
                name="status"
                value={page.values.status}
                disabled={page.isReadonly}
                readOnly
                onChange={page.handleInputChange}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Upload Bank Statement */}
        <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-bold text-darknavy">
            Upload Bank Statement
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label
                htmlFor="bank-recon-template"
                className="text-xs font-semibold text-darknavy"
              >
                Bank Template:
              </label>
              <select
                id="bank-recon-template"
                name="bankTemplate"
                value={page.values.bankTemplate}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
                className={fieldClassName}
              >
                {BankTemplateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label
                htmlFor="bank-recon-file-upload"
                className="text-xs font-semibold text-darknavy"
              >
                Bank Statement:
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="bank-recon-file-upload"
                  type="file"
                  accept=".xls,.xlsx,.xlsm"
                  disabled={page.isReadonly}
                  onChange={(e) =>
                    page.setSelectedFile(e.target.files?.[0] ?? null)
                  }
                  className="hidden"
                />
                <div className="flex h-10 flex-1 items-center rounded-md border border-darknavy/15 bg-white px-3 text-xs text-darknavy/60">
                  {page.selectedFile?.name ||
                    page.values.statementFileName ||
                    "Accepts .xls, .xlsx, .xlsm"}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={page.isReadonly}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/20 bg-offwhite px-3 text-xs font-semibold text-darknavy transition hover:bg-darknavy/10 disabled:opacity-50"
                >
                  Browse
                </button>
                <button
                  type="button"
                  onClick={page.handleUploadStatement}
                  disabled={
                    page.isReadonly ||
                    !page.selectedFile ||
                    page.isUploading
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-skyblue px-4 text-xs font-semibold text-white transition hover:bg-skyblue/90 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {page.isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Reconcile Checking Tabs */}
        <BankReconciliationCheckingTable page={page} />
      </form>

      <AppDialog
        isOpen={page.isSaveDialogOpen}
        isPending={page.isMutating}
        title="Save Bank Reconciliation?"
        description="Are you sure you want to save this bank reconciliation?"
        confirmLabel="Save"
        tone="question"
        onCancel={() => page.setIsSaveDialogOpen(false)}
        onConfirm={page.handleConfirmSave}
      />

      <AppDialog
        isOpen={page.isCancelDialogOpen}
        isPending={page.isMutating}
        title="Cancel Bank Reconciliation?"
        description={`This will change ${
          page.existingRecord?.brNo ?? "the selected reconciliation"
        } status to Cancelled.`}
        confirmLabel="Cancel Reconciliation"
        tone="danger"
        onCancel={() => page.setIsCancelDialogOpen(false)}
        onConfirm={page.handleConfirmCancel}
      />
    </>
  );
}

type TextFieldProps = {
  disabled: boolean;
  error?: string;
  isRequired?: boolean;
  label: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  type?: string;
  min?: string;
  readOnly?: boolean;
  step?: string;
  inputClassName?: string;
};

function TextField({
  disabled,
  error,
  inputClassName,
  isRequired = false,
  label,
  min,
  name,
  onChange,
  readOnly = false,
  step,
  type = "text",
  value,
}: TextFieldProps) {
  const controlId = `bank-recon-${name}`;

  return (
    <FieldShell
      controlId={controlId}
      error={error}
      isRequired={isRequired}
      label={label}
    >
      <input
        id={controlId}
        className={`${
          readOnly ? readOnlyFieldClassName : fieldClassName
        } ${inputClassName || ""}`}
        disabled={disabled}
        min={min}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
        step={step}
        type={type}
        value={value}
      />
    </FieldShell>
  );
}

function TextareaField({
  disabled,
  error,
  label,
  name,
  onChange,
  value,
}: Omit<TextFieldProps, "onChange"> & {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  const controlId = `bank-recon-${name}`;

  return (
    <FieldShell controlId={controlId} error={error} label={label}>
      <AppLimitedTextarea
        id={controlId}
        className={textareaClassName}
        disabled={disabled}
        maxLength={500}
        name={name}
        onChange={onChange}
        value={value}
      />
    </FieldShell>
  );
}

function FieldShell({
  children,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: React.ReactNode;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-1.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label
          htmlFor={controlId}
          className="pt-2 text-xs font-semibold text-darknavy"
        >
          {label}
          {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
        </label>
      ) : (
        <span className="pt-2 text-xs font-semibold text-darknavy">
          {label}
          {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
        </span>
      )}
      <div className="min-w-0">
        {children}
        {error ? <span className={errorClassName}>{error}</span> : null}
      </div>
    </div>
  );
}
