"use client";

import { type ReactNode, useState } from "react";
import { Eye, FileText, X } from "lucide-react";
import { DisbursementVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { formatCurrency, formatDateLabel } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementAttachment as VoucherAttachment,
  DisbursementLineEntry,
  DisbursementTransactionRecord,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function GridPreviewDialog({
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">Edit Disbursement Voucher</p>
          <h2 id="grid-preview-title" className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl">
            {values.voucherNo}
          </h2>
          <p className="mt-2 text-sm text-darknavy/58">
            Review the voucher details and accounting entries from grid view before continuing to the final save step.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5">
            <div className="grid items-stretch gap-5 xl:grid-cols-2">
              <PreviewShell
                description="This panel shows the source transaction that the voucher workflow will use."
                eyebrow="Transaction Preview"
                title={selectedTransaction?.payee ?? (values.partyName || "Voucher Preview")}
              >
                <div className="grid gap-5">
                  <PreviewInfoLine label="Transaction No." value={selectedTransaction?.transactionNo ?? "-"} />
                  <PreviewInfoLine label="Department" value={selectedTransaction?.department ?? "-"} />
                  <PreviewInfoLine label="Requested By" value={selectedTransaction?.requestedBy ?? "-"} />
                  <PreviewInfoLine label="Amount" value={formatCurrency(parseMoneyNumberInput(values.amount))} />
                  <PreviewInfoLine label="Purpose" value={selectedTransaction?.purpose ?? (values.remarks || "-")} />
                </div>
              </PreviewShell>

              <PreviewShell
                description="A linked voucher exists for this transaction and can be reviewed or edited."
                eyebrow="Voucher Status"
                title={values.voucherNo}
              >
                <div className="grid gap-5">
                  <PreviewInfoLine label="Document Date" value={formatDateLabel(values.voucherDate)} />
                  <PreviewInfoLine label="Payment Method" value={values.paymentMethod || "-"} />
                  <PreviewInfoLine label="Prepared By" value={values.preparedBy || "-"} />
                  <PreviewInfoLine label="Status" value={values.status || "-"} />
                  <PreviewInfoLine label="Remarks" value={values.remarks || "-"} />

                  <div className="rounded-[18px] border border-darknavy/10 bg-offwhite/45 px-4 py-4 sm:px-5 sm:py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-darknavy/45">Linked Voucher Amount</p>
                    <p className="mt-2 text-3xl font-semibold text-darknavy">{formatCurrency(parseMoneyNumberInput(values.amount))}</p>
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
                <p className="text-sm text-darknavy/58">{entries.length} accounting entries prepared.</p>
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
                  <div key={entry.id} className="rounded-[18px] border border-darknavy/8 bg-offwhite/65 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-darknavy">
                          {entry.accountCode} - {entry.accountName}
                        </p>
                        <p className="mt-1 text-sm text-darknavy/58">{entry.remarks}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/40">{entry.taxRate || "0%"}</p>
                      </div>
                      <div className="text-right text-sm font-semibold text-darknavy">
                        <p>{entry.debit > 0 ? `DR ${formatCurrency(entry.debit)}` : "-"}</p>
                        <p className="mt-1">{entry.credit > 0 ? `CR ${formatCurrency(entry.credit)}` : "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Total Debit" value={formatCurrency(totalDebit)} />
                <SummaryCard label="Total Credit" value={formatCurrency(totalCredit)} />
                <SummaryCard label="Variance" tone={isBalanced ? "balanced" : "warning"} value={formatCurrency(variance)} />
              </div>

              <AttachmentPreviewList attachments={values.attachments} />
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
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold text-darknavy sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}

function PreviewInfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/38">{label}</dt>
      <dd className="text-sm font-medium text-darknavy">{value}</dd>
    </div>
  );
}

function AttachmentPreviewList({ attachments }: { attachments: VoucherAttachment[] }) {
  const [selectedAttachment, setSelectedAttachment] = useState<VoucherAttachment | null>(null);

  return (
    <>
      <div className="mt-5 rounded-[18px] border border-darknavy/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/42">Attachments</p>
            <p className="mt-1 text-xs text-darknavy/50">Review supporting files before continuing to voucher preview.</p>
          </div>
          <span className="rounded-full border border-darknavy/10 bg-offwhite/45 px-3 py-1 text-xs font-semibold text-darknavy/55">
            {attachments.length} file{attachments.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 grid gap-3">
          {attachments.length > 0 ? (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex flex-col gap-3 rounded-xl border border-darknavy/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy/8 text-darknavy">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-darknavy">{attachment.name}</p>
                    <p className="mt-1 text-xs text-darknavy/50">{attachment.sizeLabel}</p>
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
            <div className="rounded-xl border border-dashed border-darknavy/16 bg-offwhite/45 px-4 py-8 text-center text-sm text-darknavy/55">
              No attachments are linked to this voucher yet.
            </div>
          )}
        </div>
      </div>

      <AttachmentDetailsDialog attachment={selectedAttachment} onClose={() => setSelectedAttachment(null)} />
    </>
  );
}

function AttachmentDetailsDialog({ attachment, onClose }: { attachment: VoucherAttachment | null; onClose: () => void }) {
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
        aria-labelledby="attachment-details-title"
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[20px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyblue">Attachment</p>
            <h2 id="attachment-details-title" className="mt-1 text-xl font-semibold text-darknavy">
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
              <p className="truncate text-sm font-semibold text-darknavy">{attachment.name}</p>
              <p className="mt-1 text-xs text-darknavy/55">{attachment.sizeLabel}</p>
            </div>
          </div>
          <p className="rounded-xl border border-darknavy/10 bg-white px-4 py-3 text-sm leading-6 text-darknavy/60">
            This preview shows the attachment record linked to the voucher. File opening/downloading can be connected once real attachment
            storage is available.
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

export function SummaryCard({
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-darknavy">{value}</p>
    </div>
  );
}

export function VoucherAccountingGridHeader({
  selectedTransaction,
  values,
}: {
  selectedTransaction?: DisbursementTransactionRecord;
  values: DisbursementVoucherFormValues;
}) {
  const headerFields = [
    {
      label: "DV No.",
      value: values.voucherNo || DisbursementVoucherStatuses.draft,
    },
    {
      label: "Document Date",
      value: values.voucherDate ? formatDateLabel(values.voucherDate) : "-",
    },
    {
      label: "Payee",
      value: values.partyName || selectedTransaction?.payee || "-",
    },
    {
      label: "Reference",
      value: values.voucherReferenceNo || selectedTransaction?.transactionNo || "-",
    },
    {
      label: "Payment",
      value: formatPaymentHeaderValue(values, selectedTransaction),
    },
    {
      label: "Amount",
      value: formatCurrency(values.amount ? parseMoneyNumberInput(values.amount) : selectedTransaction?.amount || 0),
    },
  ];

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-darknavy/10 bg-offwhite/45">
      <div className="flex flex-col gap-3 border-b border-darknavy/10 bg-white px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">Disbursement Voucher</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-darknavy">{values.voucherNo || "New Voucher"} Accounting Entries</h2>
        </div>
        <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-skyblue/20 bg-skyblue/8 px-4 py-2 text-sm font-semibold text-skyblue sm:w-auto">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {values.status || selectedTransaction?.status || DisbursementVoucherStatuses.draft}
        </div>
      </div>
      <div className="grid gap-px bg-darknavy/10 sm:grid-cols-2 xl:grid-cols-3">
        {headerFields.map((field) => (
          <div key={field.label} className="bg-white px-4 py-3 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-darknavy/42">{field.label}</p>
            <p className="mt-1 min-h-6 truncate text-sm font-semibold text-darknavy">{field.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatPaymentHeaderValue(values: DisbursementVoucherFormValues, selectedTransaction?: DisbursementTransactionRecord) {
  const paymentMethod = values.paymentMethod || selectedTransaction?.paymentMethod || "";
  const bankLabel = getPaymentHeaderBankLabel(values);

  if (!paymentMethod) {
    return bankLabel || "-";
  }

  return bankLabel ? `${paymentMethod} - ${bankLabel}` : paymentMethod;
}

function getPaymentHeaderBankLabel(values: DisbursementVoucherFormValues) {
  const bankName = values.paymentDetails.bankName.trim();

  if (bankName) {
    return bankName;
  }

  return values.paymentDetails.bankAccountTitle.replace(/^Cash in Bank\s*-\s*/i, "").trim();
}

export function GridEntryInput({
  disabled = false,
  extraClassName,
  id,
  inputMode,
  label,
  onChange,
  type = "text",
  value,
}: {
  disabled?: boolean;
  extraClassName?: string;
  id: string;
  inputMode?: "decimal" | "numeric" | "text";
  label: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={gridCellControlClassName(extraClassName)}
      />
    </>
  );
}

export function gridCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}
