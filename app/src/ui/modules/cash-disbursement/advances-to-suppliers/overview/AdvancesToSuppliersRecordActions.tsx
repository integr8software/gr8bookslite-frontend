"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  getAdvancesToSuppliersEditLink,
  getAdvancesToSuppliersViewLink,
  AdvancesToSuppliersStatuses,
  canEditAdvancesToSuppliers,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type {
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
  AdvancesToSuppliersUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function AdvancesToSuppliersRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: AdvancesToSuppliersUpdateStatusHandler;
  record: AdvancesToSuppliersRecord;
}) {
  const [status, setStatus] = useState<AdvancesToSuppliersStatus | null>(null);
  const isPosted = record.status === AdvancesToSuppliersStatuses.Posted;
  const isDisapproved = record.status === AdvancesToSuppliersStatuses.Disapproved;
  const isCancelled = record.status === AdvancesToSuppliersStatuses.Cancelled;
  const canEdit = canEditAdvancesToSuppliers(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== AdvancesToSuppliersStatuses.ForApproval && !isPosted,
      onSelect: () =>
        isPosted ? onUpdateStatus(record, AdvancesToSuppliersStatuses.ForApproval) : setStatus(AdvancesToSuppliersStatuses.Posted),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== AdvancesToSuppliersStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved
          ? onUpdateStatus(record, AdvancesToSuppliersStatuses.ForApproval)
          : setStatus(AdvancesToSuppliersStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: isPosted || isDisapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () =>
        isCancelled ? onUpdateStatus(record, AdvancesToSuppliersStatuses.Draft) : setStatus(AdvancesToSuppliersStatuses.Cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getAdvancesToSuppliersViewLink(record.id)}
          icon={Eye}
          label={`View advances to suppliers ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getAdvancesToSuppliersEditLink(record.id)}
            icon={Edit3}
            label={`Edit advances to suppliers ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit advances to suppliers ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for advances to suppliers ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === AdvancesToSuppliersStatuses.Posted ? "success" : "danger"}
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
