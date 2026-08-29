"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  RevolvingFundReplenishmentConfirmationDialogConfirmLabels,
  RevolvingFundReplenishmentConfirmationDialogTitles,
  RevolvingFundReplenishmentLink,
  RevolvingFundReplenishmentStatuses,
  canEditRevolvingFundReplenishment,
  getRevolvingFundReplenishmentEditLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type {
  RevolvingFundReplenishmentActionPageState,
  RevolvingFundReplenishmentConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentActionHistory } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentActionHistory";
import { RevolvingFundReplenishmentStatusActions } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function RevolvingFundReplenishmentActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: RevolvingFundReplenishmentActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<RevolvingFundReplenishmentConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Revolving Fund Replenishment"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Revolving Fund Replenishment | {transactionNo}
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
            : "Prepare revolving fund voucher entries for fund replenishment."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={RevolvingFundReplenishmentLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={RevolvingFundReplenishmentLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode !== "add" ? <RevolvingFundReplenishmentActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <RevolvingFundReplenishmentStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditRevolvingFundReplenishment(page.record.status) ? (
                  <Link href={getRevolvingFundReplenishmentEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
                  if (page.validate(RevolvingFundReplenishmentStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  page.mode === "add"
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(RevolvingFundReplenishmentStatuses.draft)) {
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
              ? "Update Revolving Fund Replenishment?"
              : RevolvingFundReplenishmentConfirmationDialogTitles[confirmation]
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
              : RevolvingFundReplenishmentConfirmationDialogConfirmLabels[confirmation]
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
          onConfirm={() => {
            if (confirmation === "save") {
              page.save(RevolvingFundReplenishmentStatuses.forApproval);
            } else if (confirmation === "draft") {
              page.save(RevolvingFundReplenishmentStatuses.draft);
            } else if (confirmation === "approve") {
              page.updateStatus(RevolvingFundReplenishmentStatuses.posted);
            } else if (confirmation === "disapprove") {
              page.updateStatus(RevolvingFundReplenishmentStatuses.disapproved);
            } else {
              page.updateStatus(RevolvingFundReplenishmentStatuses.cancelled);
            }
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
