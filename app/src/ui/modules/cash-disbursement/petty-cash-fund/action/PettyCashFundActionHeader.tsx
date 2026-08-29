"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  PettyCashFundConfirmationDialogConfirmLabels,
  PettyCashFundConfirmationDialogTitles,
  PettyCashFundLink,
  PettyCashFundStatuses,
  canEditPettyCashFund,
  getPettyCashFundEditLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundActionPageState,
  PettyCashFundConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHistory";
import { PettyCashFundStatusActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function PettyCashFundActionHeader({ onPreview, page }: { onPreview: () => void; page: PettyCashFundActionPageState }) {
  const [confirmation, setConfirmation] = useState<PettyCashFundConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Petty Cash Fund"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Petty Cash Fund | {transactionNo}
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
            : "Set up a custodian, default account, and petty cash transactions."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={PettyCashFundLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={PettyCashFundLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode !== "add" ? <PettyCashFundActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <PettyCashFundStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditPettyCashFund(page.record.status) ? (
                  <Link href={getPettyCashFundEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
                  if (page.validate(PettyCashFundStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  page.mode === "add"
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(PettyCashFundStatuses.draft)) {
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
              ? "Update Petty Cash Fund?"
              : PettyCashFundConfirmationDialogTitles[confirmation]
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
              : PettyCashFundConfirmationDialogConfirmLabels[confirmation]
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
              page.save(PettyCashFundStatuses.forApproval);
            } else if (confirmation === "draft") {
              page.save(PettyCashFundStatuses.draft);
            } else if (confirmation === "approve") {
              page.updateStatus(PettyCashFundStatuses.posted);
            } else if (confirmation === "disapprove") {
              page.updateStatus(PettyCashFundStatuses.disapproved);
            } else {
              page.updateStatus(PettyCashFundStatuses.cancelled);
            }
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
