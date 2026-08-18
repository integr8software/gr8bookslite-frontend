"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherHistoryEntry,
  DisbursementVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function DisbursementVoucherActionHistory({
  transaction,
  voucher,
}: {
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const recordLabel = voucher?.voucherNo ?? transaction?.transactionNo ?? "this disbursement voucher";

  return (
    <>
      <button
        type="button"
        disabled={!transaction && !voucher}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Open disbursement voucher history"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      <ModuleHistoryDialog
        description="Status changes and major disbursement voucher events."
        history={createDisbursementVoucherHistory({ recordLabel, transaction, voucher })}
        isOpen={isOpen}
        title="Disbursement Voucher History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createDisbursementVoucherHistory({
  recordLabel,
  transaction,
  voucher,
}: {
  recordLabel: string;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}): DisbursementVoucherHistoryEntry[] {
  if (voucher?.history?.length) {
    return voucher.history;
  }

  if (!transaction) {
    return [];
  }

  const sourceDate = transaction.updatedAt ?? transaction.createdAt ?? transaction.transactionDate;

  return [
    {
      action: "Source Transaction",
      actor: transaction.updatedBy ?? transaction.createdBy ?? "System",
      createdAt: sourceDate,
      description: `${recordLabel} is available for disbursement voucher processing.`,
      id: `dv-history-${transaction.id}-source`,
      status: transaction.status,
    },
  ];
}
