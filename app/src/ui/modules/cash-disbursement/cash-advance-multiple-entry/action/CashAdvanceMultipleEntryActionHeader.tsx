"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  CashAdvanceMultipleEntryLink,
  CashAdvanceMultipleEntryStatuses,
  getCashAdvanceMultipleEntryEditLink,
  CashAdvanceMultipleEntrySubmitConfirmationDialogConfirmLabels,
  CashAdvanceMultipleEntrySubmitConfirmationDialogTitles,
  getCashAdvanceMultipleEntryStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { createCashAdvanceMultipleEntryApprovalRecord } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryFormController,
  CashAdvanceMultipleEntryRecord,
  CashAdvanceMultipleEntrySubmitConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceMultipleEntryStatusActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryStatusActions";
import { CashAdvanceMultipleEntryActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryActionHistory";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function CashAdvanceMultipleEntryActionHeader({
  mode,
  isSubmitting,
  onPreview,
  onSaveDraft,
  onSubmit,
  onUpdateStatus,
  record,
}: {
  mode: CashAdvanceMultipleEntryActionMode;
  isSubmitting?: boolean;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onUpdateStatus: CashAdvanceMultipleEntryFormController["updateEntryStatus"];
  record: CashAdvanceMultipleEntryRecord | null;
}) {
  const [submitConfirmation, setSubmitConfirmation] = useState<CashAdvanceMultipleEntrySubmitConfirmationAction | null>(null);
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const titleLabel =
    mode === "view"
      ? `View Cash Advance Multiple Entry${record?.transNo ? ` | ${record.transNo}` : ""}`
      : mode === "edit"
        ? `Edit Cash Advance Multiple Entry${record?.transNo ? ` | ${record.transNo}` : ""}`
        : "Add Cash Advance Multiple Entry";
  const title = (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{titleLabel}</span>
      {record?.status ? <ModuleStatusBadge status={record.status} /> : null}
    </span>
  );
  const approvalRecord = createCashAdvanceMultipleEntryApprovalRecord(record);
  const recordLabel = record?.transNo ?? "this cash advance multiple entry";
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceMultipleEntryStatusDialogCopy(statusToConfirm, recordLabel, approvalRecord?.status)
    : null;

  return (
    <>
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description="Record party-level cash advances with entries, accounting, approvals, and attachments."
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={CashAdvanceMultipleEntryLink} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
            {mode !== "add" ? <CashAdvanceMultipleEntryActionHistory record={record} /> : null}
            {mode !== "add" ? (
              <CashAdvanceMultipleEntryStatusActions
                record={record}
                onRequestStatusConfirmation={setStatusToConfirm}
                onUpdateStatus={onUpdateStatus}
              />
            ) : null}
            {mode === "view" &&
            record &&
            (approvalRecord?.status === CashAdvanceMultipleEntryStatuses.draft ||
              approvalRecord?.status === CashAdvanceMultipleEntryStatuses.forApproval) ? (
              <Link href={getCashAdvanceMultipleEntryEditLink(record.id)} className={moduleHeaderActionClassNames.primary}>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            ) : null}
            {mode === "view" ? null : (
              <ModuleActionButton
                disabled={isSubmitting}
                label={isSubmitting ? "Saving..." : "Save"}
                onAction={() => setSubmitConfirmation("save")}
                menuItems={
                  mode === "add" && onSaveDraft
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => setSubmitConfirmation("draft"),
                        },
                      ]
                    : []
                }
              />
            )}
          </>
        }
      />
      {submitConfirmation ? (
        <AppDialog
          isOpen
          title={CashAdvanceMultipleEntrySubmitConfirmationDialogTitles[submitConfirmation]}
          description={`This will ${submitConfirmation === "save" ? "save and submit" : "save as draft"} ${recordLabel}.`}
          confirmLabel={CashAdvanceMultipleEntrySubmitConfirmationDialogConfirmLabels[submitConfirmation]}
          iconTone={mode === "edit" ? "update" : "save"}
          tone="default"
          onCancel={() => setSubmitConfirmation(null)}
          onConfirm={() => {
            if (submitConfirmation === "save") onSubmit();
            else onSaveDraft?.();
            setSubmitConfirmation(null);
          }}
        />
      ) : null}
      {statusDialogCopy ? (
        <AppDialog
          isOpen
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          cancelLabel="Keep Current Status"
          confirmLabel={statusDialogCopy.confirmLabel}
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onCancel={() => setStatusToConfirm(null)}
          onConfirm={() => {
            if (statusToConfirm) onUpdateStatus(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
