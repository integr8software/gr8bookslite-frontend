"use client";

import { useState } from "react";
import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import type {
  ReceivingReportRecord,
  ReceivingReportStatus,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { ReceivingReportHref } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import {
  canApproveReceivingReportStatus,
  canCancelReceivingReportStatus,
  canDisapproveReceivingReportStatus,
  canEditReceivingReportStatus,
} from "@/app/src/hooks/modules/inventory/receiving-report/useReceivingReportListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ReceivingReportRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (
    record: ReceivingReportRecord,
    status: ReceivingReportStatus,
  ) => void;
  record: ReceivingReportRecord;
}) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const isApproved = record.status === "Approved";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const canEdit = canEditReceivingReportStatus(record.status);
  const undoStatus: ReceivingReportStatus = "Draft";
  const cancelStatus: ReceivingReportStatus = isCancelled ? "Draft" : "Cancelled";
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveReceivingReportStatus(record.status),
      icon: isApproved ? Undo2 : CheckCircle2,
      label: isApproved ? "Undo Approved" : "Approve",
      onSelect: () => onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
      type: "button",
    },
    {
      disabled: !canDisapproveReceivingReportStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelReceivingReportStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => {
        if (isCancelled) {
          onUpdateStatus(record, cancelStatus);
          return;
        }

        setIsCancelDialogOpen(true);
      },
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <>
      <ModuleTableActions className="!justify-center">
        <ModuleTableActionLink
          href={`${ReceivingReportHref}/view/${record.id}`}
          icon={Eye}
          label={`View receiving report ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={`${ReceivingReportHref}/edit/${record.id}`}
            icon={Edit3}
            label={`Edit receiving report ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit receiving report ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={overflowItems}
          label={`More actions for receiving report ${record.transactionNo}`}
        />
      </ModuleTableActions>
      <AppDialog
        isOpen={isCancelDialogOpen}
        title="Cancel receiving report?"
        description={`This will mark ${record.transactionNo} as cancelled.`}
        confirmLabel="Cancel Report"
        pendingLabel="Cancelling..."
        tone="danger"
        onCancel={() => setIsCancelDialogOpen(false)}
        onConfirm={() => {
          onUpdateStatus(record, "Cancelled");
          setIsCancelDialogOpen(false);
        }}
      />
    </>
  );
}
