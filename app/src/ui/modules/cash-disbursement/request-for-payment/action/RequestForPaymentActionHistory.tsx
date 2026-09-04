"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { RequestForPaymentStatuses } from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type { RequestForPaymentRecord } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function RequestForPaymentActionHistory({ record }: { record?: RequestForPaymentRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={!record}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      <ModuleHistoryDialog
        description="Status changes and major request for payment events."
        history={createRequestForPaymentHistory(record)}
        isOpen={isOpen}
        title="Request for Payment History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createRequestForPaymentHistory(record?: RequestForPaymentRecord): ModuleHistoryEntry<RequestForPaymentRecord["status"]>[] {
  if (!record) return [];
  const history: ModuleHistoryEntry<RequestForPaymentRecord["status"]>[] = [
    {
      action: "Created",
      actor: record.createdBy,
      createdAt: record.createdAt,
      description: `${record.transactionNo} was created.`,
      id: `rfp-history-${record.id}-created`,
      status: RequestForPaymentStatuses.draft,
    },
  ];
  if (record.updatedAt !== record.createdAt || record.status !== RequestForPaymentStatuses.draft) {
    history.push({
      action: "Updated",
      actor: record.updatedBy,
      createdAt: record.updatedAt,
      description: `${record.transactionNo} is currently ${record.status}.`,
      id: `rfp-history-${record.id}-updated`,
      status: record.status,
    });
  }
  return history;
}
