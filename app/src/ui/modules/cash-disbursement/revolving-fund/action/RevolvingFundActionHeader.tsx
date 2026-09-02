"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  RevolvingFundConfirmationDialogConfirmLabels,
  RevolvingFundConfirmationDialogTitles,
  RevolvingFundLink,
  RevolvingFundStatuses,
  canEditRevolvingFund,
  getRevolvingFundEditLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundActionPageState,
  RevolvingFundConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundActionHistory } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionHistory";
import { RevolvingFundStatusActions } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function RevolvingFundActionHeader({ onPreview, page }: { onPreview: () => void; page: RevolvingFundActionPageState }) {
  const [confirmation, setConfirmation] = useState<RevolvingFundConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const isDraftEdit = page.mode === "edit" && page.record?.status === RevolvingFundStatuses.draft;
  const isSaveAction = page.mode === "add" || isDraftEdit;
  const title =
    page.mode === "add" ? (
      "Add Revolving Fund"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Revolving Fund | {transactionNo}
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
            ? "Review the fund details, entries, and supporting files."
            : "Set up a custodian, default account, and revolving fund transactions."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={RevolvingFundLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={RevolvingFundLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode !== "add" ? <RevolvingFundActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <RevolvingFundStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditRevolvingFund(page.record.status) ? (
                  <Link href={getRevolvingFundEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
                  if (page.validate(RevolvingFundStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  isSaveAction
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(RevolvingFundStatuses.draft)) {
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
              ? "Update Revolving Fund?"
              : RevolvingFundConfirmationDialogTitles[confirmation]
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
              : RevolvingFundConfirmationDialogConfirmLabels[confirmation]
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
              isSuccessful = await page.save(RevolvingFundStatuses.forApproval);
            } else if (confirmation === "draft") {
              isSuccessful = await page.save(RevolvingFundStatuses.draft);
            } else if (confirmation === "approve") {
              isSuccessful = await page.updateStatus(RevolvingFundStatuses.posted);
            } else if (confirmation === "disapprove") {
              isSuccessful = await page.updateStatus(RevolvingFundStatuses.disapproved);
            } else {
              isSuccessful = await page.updateStatus(RevolvingFundStatuses.cancelled);
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
