"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  PettyCashVoucherConfirmationDialogConfirmLabels,
  PettyCashVoucherConfirmationDialogTitles,
  PettyCashVoucherLink,
  PettyCashVoucherStatuses,
  canEditPettyCashVoucher,
  getPettyCashVoucherEditLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherActionPageState,
  PettyCashVoucherConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { PettyCashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHistory";
import { PettyCashVoucherStatusActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function PettyCashVoucherActionHeader({ onPreview, page }: { onPreview: () => void; page: PettyCashVoucherActionPageState }) {
  const [confirmation, setConfirmation] = useState<PettyCashVoucherConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const isDraftEdit = page.mode === "edit" && page.record?.status === PettyCashVoucherStatuses.Draft;
  const isSaveAction = page.mode === "add" || isDraftEdit;
  const title =
    page.mode === "add" ? (
      "Add Petty Cash Voucher"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Petty Cash Voucher | {transactionNo}
        </span>
        <ModuleStatusBadge status={page.values.status} />
      </span>
    );

  return (
    <>
      <ModuleHeader
        variant="panel"
        title={title}
        titleAs="h1"
        description={
          page.mode === "view"
            ? "Review the voucher details, entries, and supporting files."
            : "Set up a custodian, default account, and petty cash transactions."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
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
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode !== "add" ? <PettyCashVoucherActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <PettyCashVoucherStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditPettyCashVoucher(page.record.status) ? (
                  <Link href={getPettyCashVoucherEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                ) : null}
              </>
            ) : null}
            {page.mode !== "view" ? (
              <ModuleActionButton
                disabled={page.isSubmitting}
                label={isSaveAction ? "Save" : "Update"}
                onAction={() => {
                  if (page.validate(PettyCashVoucherStatuses.ForApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  isSaveAction
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(PettyCashVoucherStatuses.Draft)) {
                              setConfirmation("draft");
                            }
                          },
                        },
                      ]
                    : []
                }
              />
            ) : null}
          </>
        }
      />
      {confirmation ? (
        <AppDialog
          isOpen
          title={
            confirmation === "save" && !isSaveAction
              ? "Update Petty Cash Voucher?"
              : PettyCashVoucherConfirmationDialogTitles[confirmation]
          }
          description={
            confirmation === "save"
              ? !isSaveAction
                ? `This will update ${transactionNo}.`
                : `This will save and submit ${transactionNo}.`
              : confirmation === "draft"
                ? `This will save ${transactionNo} as draft.`
                : confirmation === "approve"
                  ? `This will approve ${transactionNo}.`
                  : confirmation === "disapprove"
                    ? `This will mark ${transactionNo} as disapproved.`
                    : `This will mark ${transactionNo} as cancelled.`
          }
          confirmLabel={
            confirmation === "save" && !isSaveAction
              ? "Update"
              : PettyCashVoucherConfirmationDialogConfirmLabels[confirmation]
          }
          cancelLabel="Cancel"
          iconTone={confirmation === "save" ? (isSaveAction ? "save" : "update") : confirmation === "draft" ? "save" : undefined}
          isPending={page.isSubmitting}
          pendingLabel={confirmation === "save" && !isSaveAction ? "Updating..." : "Saving..."}
          tone={
            confirmation === "approve"
              ? "success"
              : confirmation === "disapprove"
                ? "danger"
                : confirmation === "cancel"
                  ? "warning"
                  : "default"
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={async () => {
            let isSuccessful = false;

            if (confirmation === "save") {
              isSuccessful = await page.save(PettyCashVoucherStatuses.ForApproval);
            } else if (confirmation === "draft") {
              isSuccessful = await page.save(PettyCashVoucherStatuses.Draft);
            } else if (confirmation === "approve") {
              isSuccessful = await page.updateStatus(PettyCashVoucherStatuses.Posted);
            } else if (confirmation === "disapprove") {
              isSuccessful = await page.updateStatus(PettyCashVoucherStatuses.Disapproved);
            } else {
              isSuccessful = await page.updateStatus(PettyCashVoucherStatuses.Cancelled);
            }

            if (isSuccessful) {
              setConfirmation(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
