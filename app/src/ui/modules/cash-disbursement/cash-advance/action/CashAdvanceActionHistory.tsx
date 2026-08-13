"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function CashAdvanceActionHistory({ record }: { record?: CashAdvanceRecord | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={!record}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Open cash advance history"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      <ModuleHistoryDialog
        description="Status changes and major cash advance events."
        history={createCashAdvanceHistory(record)}
        isOpen={isOpen}
        title="Cash Advance History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createCashAdvanceHistory(
  record?: CashAdvanceRecord | null,
): ModuleHistoryEntry<CashAdvanceStatus>[] {
  if (!record) {
    return [];
  }

  const createdAt = record.createdAt ?? record.documentDate;
  const updatedAt = record.updatedAt ?? record.createdAt ?? record.documentDate;
  const history: ModuleHistoryEntry<CashAdvanceStatus>[] = [
    {
      action: "Created",
      actor: record.createdBy ?? record.partyName ?? "System",
      createdAt,
      description: `${record.transNo} was created.`,
      id: `ca-history-${record.id}-created`,
      status: CashAdvanceStatuses.draft,
    },
  ];

  if (updatedAt !== createdAt || record.status !== CashAdvanceStatuses.draft) {
    history.push({
      action: "Updated",
      actor: record.updatedBy ?? record.createdBy ?? "System",
      createdAt: updatedAt,
      description: `${record.transNo} is currently ${record.status}.`,
      id: `ca-history-${record.id}-updated`,
      status: record.status,
    });
  }

  return history;
}
