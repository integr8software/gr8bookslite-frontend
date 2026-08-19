"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, CreditCard, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashVoucherActionButtonClassNames,
  PettyCashVoucherActionDescriptions,
  PettyCashVoucherLink,
  PettyCashVoucherStatuses,
  canApprovePettyCashVoucherStatus,
  canCancelPettyCashVoucherStatus,
  canDisapprovePettyCashVoucherStatus,
  getPettyCashVoucherStatusDialogCopy,
  getPettyCashVoucherActionTitle,
  getPettyCashVoucherSaveDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type {
  PettyCashVoucherConfirmation,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { PettyCashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHistory";

export function PettyCashVoucherActionHeader({ page }: { page: PettyCashVoucherActionPageState }) {
  const [confirmation, setConfirmation] = useState<PettyCashVoucherConfirmation | null>(null);
  const recordLabel = page.values.transactionNo || "this petty cash voucher";
  const dialogCopy = confirmation
    ? confirmation.action === "status"
      ? getPettyCashVoucherStatusDialogCopy(confirmation.status, recordLabel)
      : getPettyCashVoucherSaveDialogCopy(confirmation.action, page.mode, recordLabel)
    : null;

  return (
    <>
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={getPettyCashVoucherActionTitle(page.mode, page.existingVoucher?.voucherNo)}
        description={PettyCashVoucherActionDescriptions[page.mode]}
        actionsClassName="items-center justify-end gap-2"
        eyebrow={<PettyCashVoucherHeaderEyebrow />}
        actions={<PettyCashVoucherHeaderActions page={page} onRequestConfirmation={setConfirmation} />}
      />
      {dialogCopy && confirmation ? (
        <AppDialog
          isOpen
          cancelLabel={confirmation.action === "status" ? "Keep Current Status" : "Continue Editing"}
          confirmLabel={dialogCopy.confirmLabel}
          description={dialogCopy.description}
          iconTone={dialogCopy.iconTone}
          pendingLabel={dialogCopy.pendingLabel}
          title={dialogCopy.title}
          tone={dialogCopy.tone}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            const succeeded = runConfirmedAction(page, confirmation);

            if (succeeded !== false) {
              setConfirmation(null);
            }
          }}
        />
      ) : null}
    </>
  );
}

function PettyCashVoucherHeaderEyebrow() {
  return (
    <span className="contents">
      <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
      Cash disbursement
    </span>
  );
}

function PettyCashVoucherHeaderActions({
  onRequestConfirmation,
  page,
}: {
  onRequestConfirmation: (confirmation: PettyCashVoucherConfirmation) => void;
  page: PettyCashVoucherActionPageState;
}) {
  return (
    <span className="contents">
      <Link href={PettyCashVoucherLink} className={moduleHeaderActionClassNames.secondary}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      <ReportPreviewAction onPreview={() => undefined} />
      {page.mode === "view" ? <PettyCashVoucherActionHistory page={page} /> : null}
      {page.mode !== "add" ? (
        <PettyCashVoucherStatusActions
          status={page.values.status}
          onRequestStatus={(status) => onRequestConfirmation({ action: "status", status })}
        />
      ) : null}
      {page.isReadonly ? null : (
        <ModuleActionButton
          disabled={page.isSubmitting}
          label={page.isSubmitting ? "Saving..." : "Save"}
          onAction={() => onRequestConfirmation({ action: "submit" })}
          menuItems={
            page.mode === "add"
              ? [
                  {
                    label: "Save As Draft",
                    onSelect: () => onRequestConfirmation({ action: "draft" }),
                  },
                ]
              : []
          }
        />
      )}
    </span>
  );
}

function PettyCashVoucherStatusActions({
  status,
  onRequestStatus,
}: {
  status: PettyCashVoucherActionPageState["values"]["status"];
  onRequestStatus: (status: PettyCashVoucherStatus) => void;
}) {
  const isPosted = status === PettyCashVoucherStatuses.posted;
  const isDisapproved = status === PettyCashVoucherStatuses.disapproved;
  const isCancelled = status === PettyCashVoucherStatuses.cancelled;

  return (
    <span className="contents">
      <button
        type="button"
        disabled={!canApprovePettyCashVoucherStatus(status)}
        onClick={() => onRequestStatus(isPosted ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.posted)}
        className={PettyCashVoucherActionButtonClassNames.approve}
      >
        {isPosted ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <ThumbsUp className="h-4 w-4" aria-hidden="true" />}
        {isPosted ? "Undo Approved" : "Approve"}
      </button>
      <button
        type="button"
        disabled={!canDisapprovePettyCashVoucherStatus(status)}
        onClick={() => onRequestStatus(isDisapproved ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.disapproved)}
        className={PettyCashVoucherActionButtonClassNames.disapprove}
      >
        {isDisapproved ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <ThumbsDown className="h-4 w-4" aria-hidden="true" />}
        {isDisapproved ? "Undo Disapproved" : "Disapprove"}
      </button>
      <button
        type="button"
        disabled={!canCancelPettyCashVoucherStatus(status)}
        onClick={() => onRequestStatus(isCancelled ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.cancelled)}
        className={PettyCashVoucherActionButtonClassNames.cancel}
      >
        {isCancelled ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
        {isCancelled ? "Undo Cancelled" : "Cancel"}
      </button>
    </span>
  );
}

function runConfirmedAction(page: PettyCashVoucherActionPageState, confirmation: PettyCashVoucherConfirmation) {
  if (confirmation.action === "status") {
    return page.handleUpdateStatus(confirmation.status);
  }

  if (confirmation.action === "submit") {
    return page.handleSubmit();
  }

  return page.handleSaveAsDraft();
}
