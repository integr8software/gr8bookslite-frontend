"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type {
  CashVoucherTransactionRecord,
  CashVoucherHistoryEntry,
  CashVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function CashVoucherActionHistory({
  transaction,
  voucher,
}: {
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const recordLabel = voucher?.voucherNo ?? transaction?.transactionNo ?? "this cash voucher";

  return (
    <>
      <button
        type="button"
        disabled={!transaction && !voucher}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Open cash voucher history"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      <ModuleHistoryDialog
        description="Status changes and major cash voucher events."
        history={createCashVoucherHistory({ recordLabel, transaction, voucher })}
        isOpen={isOpen}
        title="Cash Voucher History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createCashVoucherHistory({
  recordLabel,
  transaction,
  voucher,
}: {
  recordLabel: string;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}): CashVoucherHistoryEntry[] {
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
      description: `${recordLabel} is available for cash voucher processing.`,
      id: `cv-history-${transaction.id}-source`,
      status: transaction.status,
    },
  ];
}


