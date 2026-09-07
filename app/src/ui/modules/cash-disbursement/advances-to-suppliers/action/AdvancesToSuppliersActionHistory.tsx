"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type { AdvancesToSuppliersRecord } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function AdvancesToSuppliersActionHistory({ record }: { record?: AdvancesToSuppliersRecord }) {
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
        description="Status changes and major advances to suppliers events."
        history={createHistory(record)}
        isOpen={isOpen}
        title="Advances to Suppliers History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createHistory(record?: AdvancesToSuppliersRecord): ModuleHistoryEntry<AdvancesToSuppliersRecord["status"]>[] {
  if (!record) return [];
  const history: ModuleHistoryEntry<AdvancesToSuppliersRecord["status"]>[] = [
    {
      action: "Created",
      actor: record.createdBy,
      createdAt: record.createdAt,
      description: `${record.transactionNo} was created.`,
      id: `ats-history-${record.id}-created`,
      status: AdvancesToSuppliersStatuses.Draft,
    },
  ];
  if (record.updatedAt !== record.createdAt || record.status !== AdvancesToSuppliersStatuses.Draft)
    history.push({
      action: "Updated",
      actor: record.updatedBy,
      createdAt: record.updatedAt,
      description: `${record.transactionNo} is currently ${record.status}.`,
      id: `ats-history-${record.id}-updated`,
      status: record.status,
    });
  return history;
}
