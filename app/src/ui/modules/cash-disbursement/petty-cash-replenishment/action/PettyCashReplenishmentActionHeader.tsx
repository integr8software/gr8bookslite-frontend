"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  PettyCashReplenishmentConfirmationDialogConfirmLabels,
  PettyCashReplenishmentConfirmationDialogTitles,
  PettyCashReplenishmentLink,
  PettyCashReplenishmentStatuses,
  canEditPettyCashReplenishment,
  getPettyCashReplenishmentEditLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import type {
  PettyCashReplenishmentActionPageState,
  PettyCashReplenishmentConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { PettyCashReplenishmentActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentActionHistory";
import { PettyCashReplenishmentStatusActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function PettyCashReplenishmentActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: PettyCashReplenishmentActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<PettyCashReplenishmentConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Petty Cash Replenishment"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Petty Cash Replenishment | {transactionNo}
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
            ? "Review replenishment details, entries, and supporting files."
            : "Prepare petty cash voucher entries for replenishment."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={PettyCashReplenishmentLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={PettyCashReplenishmentLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode === "add" ? (
              <AppCopyFromDropdown
                records={page.pettyCashFundCopyFromRecords}
                selectionMode="single"
                sources={["Petty Cash Fund"]}
                onApply={page.copyFromPettyCashFund}
              />
            ) : null}
            {page.mode !== "add" ? <PettyCashReplenishmentActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <PettyCashReplenishmentStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditPettyCashReplenishment(page.record.status) ? (
                  <Link href={getPettyCashReplenishmentEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                ) : null}
              </>
            ) : null}
            {page.mode !== "view" ? (
              <ModuleActionButton
                disabled={page.isSubmitting}
                label={page.mode === "edit" ? "Update" : "Save"}
                onAction={() => {
                  if (page.validate(PettyCashReplenishmentStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  page.mode === "add"
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(PettyCashReplenishmentStatuses.draft)) {
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
            confirmation === "save" && page.mode === "edit"
              ? "Update Petty Cash Replenishment?"
              : PettyCashReplenishmentConfirmationDialogTitles[confirmation]
          }
          description={
            confirmation === "save"
              ? page.mode === "edit"
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
            confirmation === "save" && page.mode === "edit"
              ? "Update"
              : PettyCashReplenishmentConfirmationDialogConfirmLabels[confirmation]
          }
          cancelLabel="Cancel"
          iconTone={confirmation === "save" ? (page.mode === "edit" ? "update" : "save") : confirmation === "draft" ? "save" : undefined}
          isPending={page.isSubmitting}
          pendingLabel={confirmation === "save" && page.mode === "edit" ? "Updating..." : "Saving..."}
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
              isSuccessful = await page.save(PettyCashReplenishmentStatuses.forApproval);
            } else if (confirmation === "draft") {
              isSuccessful = await page.save(PettyCashReplenishmentStatuses.draft);
            } else if (confirmation === "approve") {
              isSuccessful = await page.updateStatus(PettyCashReplenishmentStatuses.posted);
            } else if (confirmation === "disapprove") {
              isSuccessful = await page.updateStatus(PettyCashReplenishmentStatuses.disapproved);
            } else {
              isSuccessful = await page.updateStatus(PettyCashReplenishmentStatuses.cancelled);
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
