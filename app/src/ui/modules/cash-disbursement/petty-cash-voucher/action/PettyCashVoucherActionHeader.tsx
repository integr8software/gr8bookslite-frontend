"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Edit3 } from "lucide-react";
import {
  PettyCashVoucherActionDescriptions,
  PettyCashVoucherLink,
  canEditPettyCashVoucherStatus,
  getPettyCashVoucherStatusDialogCopy,
  getPettyCashVoucherEditLink,
  getPettyCashVoucherActionTitle,
  getPettyCashVoucherSaveDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherActionPageState,
  PettyCashVoucherConfirmation,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { PettyCashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHistory";
import { PettyCashVoucherStatusActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherStatusActions";

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
      <Link href={PettyCashVoucherLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      {page.mode !== "view" ? (
        <ModuleDraftDiscardAction
          hasChanges={page.hasDiscardableChanges}
          href={PettyCashVoucherLink}
          mode={page.mode}
          onDiscard={page.discardDraft}
        />
      ) : null}
      <ReportPreviewAction onPreview={page.openReportPreview} />
      {page.mode === "view" ? <PettyCashVoucherActionHistory page={page} /> : null}
      {page.mode !== "add" ? (
        <PettyCashVoucherStatusActions
          status={page.values.status}
          onRequestStatus={(status) => onRequestConfirmation({ action: "status", status })}
        />
      ) : null}
      {page.mode === "view" && page.existingVoucher && canEditPettyCashVoucherStatus(page.existingVoucher.status) ? (
        <Link href={getPettyCashVoucherEditLink(page.existingVoucher.id)} className={moduleHeaderActionClassNames.primary}>
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Edit
        </Link>
      ) : null}
      {page.isReadonly ? null : (
        <ModuleActionButton
          disabled={page.isSubmitting}
          label={page.isSubmitting ? "Saving..." : page.mode === "edit" ? "Update" : "Save"}
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

function runConfirmedAction(page: PettyCashVoucherActionPageState, confirmation: PettyCashVoucherConfirmation) {
  if (confirmation.action === "status") {
    return page.handleUpdateStatus(confirmation.status);
  }

  if (confirmation.action === "submit") {
    return page.handleSubmit();
  }

  return page.handleSaveAsDraft();
}
