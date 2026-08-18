"use client";

import { useState } from "react";
import { FileClock } from "lucide-react";
import { PettyCashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type { PettyCashVoucherStatus } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleHistoryDialog } from "@/app/src/ui/shared/module/ModuleHistoryDialog";

export function PettyCashVoucherActionHistory({ page }: { page: PettyCashVoucherActionPageState }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={moduleHeaderActionClassNames.secondary}>
        <FileClock className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      <ModuleHistoryDialog
        description="Status changes and major petty cash voucher events."
        history={createPettyCashVoucherHistory(page)}
        isOpen={isOpen}
        title="Petty Cash Voucher History"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function createPettyCashVoucherHistory(page: PettyCashVoucherActionPageState): ModuleHistoryEntry<PettyCashVoucherStatus>[] {
  const record = page.existingVoucher;

  if (!record) {
    return [];
  }

  const currentStatus = page.values.status === PettyCashVoucherStatuses.open ? record.status : page.values.status;
  const history: ModuleHistoryEntry<PettyCashVoucherStatus>[] = [
    {
      action: "Voucher created",
      actor: record.createdBy,
      createdAt: record.dateCreated,
      description: `${record.voucherNo} was created.`,
      id: `${record.id}-created`,
      status: PettyCashVoucherStatuses.draft,
    },
  ];

  if (record.dateModified !== record.dateCreated || currentStatus !== PettyCashVoucherStatuses.draft) {
    history.push({
      action: `Status changed to ${currentStatus}`,
      actor: record.updatedBy,
      createdAt: record.dateModified,
      description: `${record.voucherNo} is currently ${currentStatus}.`,
      id: `${record.id}-updated`,
      status: currentStatus,
    });
  }

  return history;
}
