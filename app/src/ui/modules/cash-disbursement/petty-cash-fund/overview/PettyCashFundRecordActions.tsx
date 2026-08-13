"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  PettyCashFundHref,
  PettyCashFundStatuses,
  canEditPettyCashFund,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundRecord,
  PettyCashFundStatus,
  PettyCashFundUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashFundRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: PettyCashFundUpdateStatusHandler;
  record: PettyCashFundRecord;
}) {
  const [status, setStatus] = useState<PettyCashFundStatus | null>(null);
  const items: ModuleActionMenuItem[] = [
    { type: "link", href: `${PettyCashFundHref}/view/${record.id}`, icon: Eye, label: "View" },
    ...(canEditPettyCashFund(record.status)
      ? [{ type: "link" as const, href: `${PettyCashFundHref}/edit/${record.id}`, icon: Edit3, label: "Edit" }]
      : []),
    {
      type: "button",
      icon: ThumbsUp,
      label: "Approve",
      disabled: record.status !== PettyCashFundStatuses.forApproval,
      onSelect: () => setStatus(PettyCashFundStatuses.posted),
    },
    {
      type: "button",
      icon: ThumbsDown,
      label: "Disapprove",
      disabled: record.status !== PettyCashFundStatuses.forApproval,
      tone: "danger",
      onSelect: () => setStatus(PettyCashFundStatuses.disapproved),
    },
    {
      type: "button",
      icon: Ban,
      label: "Cancel",
      disabled: record.status === PettyCashFundStatuses.posted || record.status === PettyCashFundStatuses.cancelled,
      tone: "danger",
      onSelect: () => setStatus(PettyCashFundStatuses.cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleActionMenu items={items} label={`Actions for petty cash fund ${record.transactionNo}`} />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === PettyCashFundStatuses.posted ? "success" : "danger"}
          onCancel={() => setStatus(null)}
          onConfirm={() => {
            onUpdateStatus(record, status);
            setStatus(null);
          }}
        />
      ) : null}
    </>
  );
}
