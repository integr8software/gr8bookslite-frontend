"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  RequestForPaymentStatuses,
  canEditRequestForPayment,
  getRequestForPaymentEditLink,
  getRequestForPaymentViewLink,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentRecord,
  RequestForPaymentStatus,
  RequestForPaymentUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function RequestForPaymentRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: RequestForPaymentUpdateStatusHandler;
  record: RequestForPaymentRecord;
}) {
  const [status, setStatus] = useState<RequestForPaymentStatus | null>(null);
  const isApproved = record.status === RequestForPaymentStatuses.approved;
  const isDisapproved = record.status === RequestForPaymentStatuses.disapproved;
  const isCancelled = record.status === RequestForPaymentStatuses.cancelled;
  const canEdit = canEditRequestForPayment(record.status);

  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isApproved ? Undo2 : ThumbsUp,
      label: isApproved ? "Undo Approved" : "Approve",
      disabled: record.status !== RequestForPaymentStatuses.forApproval && !isApproved,
      onSelect: () =>
        isApproved
          ? onUpdateStatus(record, RequestForPaymentStatuses.forApproval)
          : setStatus(RequestForPaymentStatuses.approved),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== RequestForPaymentStatuses.forApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved
          ? onUpdateStatus(record, RequestForPaymentStatuses.forApproval)
          : setStatus(RequestForPaymentStatuses.disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: record.status === RequestForPaymentStatuses.approved || record.status === RequestForPaymentStatuses.disapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () =>
        isCancelled
          ? onUpdateStatus(record, RequestForPaymentStatuses.draft)
          : setStatus(RequestForPaymentStatuses.cancelled),
    },
  ];

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getRequestForPaymentViewLink(record.id)}
          icon={Eye}
          label={`View payment request ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getRequestForPaymentEditLink(record.id)}
            icon={Edit3}
            label={`Edit payment request ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit payment request ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for payment request ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === RequestForPaymentStatuses.approved ? "success" : "danger"}
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
