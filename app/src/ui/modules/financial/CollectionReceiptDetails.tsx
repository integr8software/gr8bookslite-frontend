"use client";

import type { ReactNode } from "react";
import { Download, Eye, ReceiptText, X } from "lucide-react";
import type {
  ErpBranch,
  ErpReceipt,
} from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";

const statusClasses = {
  Deposited: "bg-emerald-50 text-emerald-600",
  "Pending Deposit": "bg-amber-50 text-amber-600",
  Voided: "bg-red-50 text-red-600",
} as const;

export function CollectionReceiptDetails({
  currentBranch,
  selectedReceipt,
}: {
  currentBranch: ErpBranch;
  selectedReceipt: ErpReceipt;
}) {
  return (
    <aside className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {selectedReceipt.receiptNo}
          </h2>
          <ReceiptStatusBadge status={selectedReceipt.status} />
        </div>
        <button className="rounded-xl p-2 text-slate-500">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-8 border-b border-slate-200 px-5 text-sm font-medium">
        <button className="border-b-2 border-blue-600 pb-4 pt-4 text-blue-600">
          Details
        </button>
        <button className="pb-4 pt-4 text-slate-500">Activity</button>
      </div>

      <div className="space-y-4 p-5">
        <DetailCard title="Receipt Information">
          <DetailRow label="Receipt No." value={selectedReceipt.receiptNo} />
          <DetailRow label="Receipt Date" value={selectedReceipt.receiptDate} />
          <DetailRow
            label="Branch / Site"
            value={`${currentBranch.name} (${currentBranch.code})`}
            badge={currentBranch.code}
          />
          <DetailRow label="Customer" value={selectedReceipt.customer} />
          <DetailRow label="Amount" value={selectedReceipt.amount} />
          <DetailRow
            label="Payment Method"
            value={selectedReceipt.paymentMethod}
          />
          <DetailRow label="Reference No." value={selectedReceipt.referenceNo} />
          <DetailRow label="Status" value={selectedReceipt.status} />
        </DetailCard>

        <DetailCard title="Applied To">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Invoice No.</th>
                  <th className="pb-3 font-medium">Invoice Date</th>
                  <th className="pb-3 text-right font-medium">Amount Applied</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.appliedInvoices.map((invoice) => (
                  <tr key={invoice.invoiceNo} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-blue-600">
                      {invoice.invoiceNo}
                    </td>
                    <td className="py-3 text-slate-700">{invoice.invoiceDate}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {invoice.amountApplied}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200">
                  <td className="py-3 font-semibold text-slate-900">
                    Total Applied
                  </td>
                  <td />
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {selectedReceipt.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DetailCard>

        <DetailCard title="Deposit Information">
          <DetailRow label="Deposit Slip No." value={selectedReceipt.depositSlipNo} />
          <DetailRow label="Deposit Date" value={selectedReceipt.depositDate} />
          <DetailRow label="Bank Account" value={selectedReceipt.bankAccount} />
        </DetailCard>

        <DetailCard title={`Attachments (${selectedReceipt.attachments.length})`}>
          <div className="space-y-3">
            {selectedReceipt.attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ReceiptText className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {attachment.name}
                </span>
                <span className="text-xs text-slate-500">{attachment.size}</span>
                <button className="rounded-xl border border-slate-200 p-2 text-slate-500">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </DetailCard>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-200 px-5 py-5">
        <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          Print Receipt
        </button>
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
          <Eye className="h-4 w-4" />
          <span>View / Edit</span>
        </button>
      </div>
    </aside>
  );
}

function ReceiptStatusBadge({ status }: { status: ErpReceipt["status"] }) {
  return (
    <span
      className={joinClasses(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

function DetailCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({
  badge,
  label,
  value,
}: {
  badge?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">
        {badge ? (
          <span className="mr-2 rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] text-blue-700">
            {badge}
          </span>
        ) : null}
        {value}
      </span>
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
