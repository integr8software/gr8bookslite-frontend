"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function PettyCashFundActionHistory({ record }: { record?: PettyCashFundRecord }) {
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
        description="Status changes and major petty cash fund events."
        history={createPettyCashFundHistory(record)}
        isOpen={isOpen}
        title="Petty Cash Fund History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createPettyCashFundHistory(record?: PettyCashFundRecord): ModuleHistoryEntry<PettyCashFundRecord["status"]>[] {
  if (!record) return [];
  const history: ModuleHistoryEntry<PettyCashFundRecord["status"]>[] = [
    {
      action: "Created",
      actor: record.createdBy,
      createdAt: record.createdAt,
      description: `${record.transactionNo} was created.`,
      id: `pcf-history-${record.id}-created`,
      status: PettyCashFundStatuses.Draft,
    },
  ];
  if (record.updatedAt !== record.createdAt || record.status !== PettyCashFundStatuses.Draft) {
    history.push({
      action: "Updated",
      actor: record.updatedBy,
      createdAt: record.updatedAt,
      description: `${record.transactionNo} is currently ${record.status}.`,
      id: `pcf-history-${record.id}-updated`,
      status: record.status,
    });
  }
  return history;
}
