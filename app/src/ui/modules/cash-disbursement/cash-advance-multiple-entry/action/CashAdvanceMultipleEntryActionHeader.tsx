"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  CashAdvanceMultipleEntryLink,
  CashAdvanceMultipleEntryStatuses,
  canEditCashAdvanceMultipleEntryStatus,
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
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function CashAdvanceMultipleEntryActionHeader({
  mode,
  hasDiscardableChanges,
  isSubmitting,
  onBack,
  onDiscard,
  onPreview,
  onSaveDraft,
  onSubmit,
  onUpdateStatus,
  onValidate,
  record,
}: {
  mode: CashAdvanceMultipleEntryActionMode;
  hasDiscardableChanges: boolean;
  isSubmitting?: boolean;
  onBack?: () => void;
  onDiscard?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => boolean | void;
  onSubmit: () => boolean | void;
  onUpdateStatus: CashAdvanceMultipleEntryFormController["updateEntryStatus"];
  onValidate?: (status?: CashAdvanceStatus) => boolean;
  record: CashAdvanceMultipleEntryRecord | null;
}) {
  const [submitConfirmation, setSubmitConfirmation] = useState<CashAdvanceMultipleEntrySubmitConfirmationAction | null>(null);
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const approvalRecord = createCashAdvanceMultipleEntryApprovalRecord(record);
  const recordLabel = record?.transNo ?? "this cash advance multiple entry";
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceMultipleEntryStatusDialogCopy(statusToConfirm, recordLabel, approvalRecord?.status)
    : null;
  const isDraftEdit = mode === "edit" && record?.status === CashAdvanceMultipleEntryStatuses.draft;
  const isSaveAction = mode === "add" || isDraftEdit;
  const title =
    mode === "add" ? (
      "Add Cash Advance Multiple Entry"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {mode === "view" ? "View" : "Edit"} Cash Advance Multiple Entry | {recordLabel}
        </span>
        {record?.status ? <ModuleStatusBadge status={record.status} /> : null}
      </span>
    );

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
            <Link href={CashAdvanceMultipleEntryLink} className={moduleHeaderActionClassNames.secondary} onClick={onBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {mode !== "view" && onDiscard ? (
              <ModuleDraftDiscardAction
                hasChanges={hasDiscardableChanges}
                href={CashAdvanceMultipleEntryLink}
                mode={mode}
                onDiscard={onDiscard}
              />
            ) : null}
            {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
            {mode !== "add" ? <CashAdvanceMultipleEntryActionHistory record={record} /> : null}
            {mode !== "add" ? (
              <CashAdvanceMultipleEntryStatusActions
                record={record}
                onRequestStatusConfirmation={setStatusToConfirm}
                onUpdateStatus={onUpdateStatus}
              />
            ) : null}
            {mode === "view" && record && approvalRecord && canEditCashAdvanceMultipleEntryStatus(approvalRecord.status) ? (
              <Link href={getCashAdvanceMultipleEntryEditLink(record.id)} className={moduleHeaderActionClassNames.primary}>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            ) : null}
            {mode === "view" ? null : (
              <ModuleActionButton
                disabled={isSubmitting}
                label={isSaveAction ? "Save" : "Update"}
                onAction={() => {
                  if (onValidate ? onValidate(CashAdvanceMultipleEntryStatuses.forApproval) : true) {
                    setSubmitConfirmation("save");
                  }
                }}
                menuItems={
                  isSaveAction && onSaveDraft
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (onValidate ? onValidate(CashAdvanceMultipleEntryStatuses.draft) : true) {
                              setSubmitConfirmation("draft");
                            }
                          },
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
          title={
            submitConfirmation === "save" && !isSaveAction
              ? "Update Cash Advance Multiple Entry?"
              : CashAdvanceMultipleEntrySubmitConfirmationDialogTitles[submitConfirmation]
          }
          description={
            submitConfirmation === "save"
              ? !isSaveAction
                ? `This will update ${recordLabel}.`
                : `This will save and submit ${recordLabel}.`
              : `This will save ${recordLabel} as draft.`
          }
          confirmLabel={
            submitConfirmation === "save" && !isSaveAction
              ? "Update"
              : CashAdvanceMultipleEntrySubmitConfirmationDialogConfirmLabels[submitConfirmation]
          }
          cancelLabel="Cancel"
          iconTone={submitConfirmation === "save" ? (isSaveAction ? "save" : "update") : "save"}
          isPending={isSubmitting}
          pendingLabel={isSaveAction ? "Saving..." : "Updating..."}
          tone="default"
          onCancel={() => setSubmitConfirmation(null)}
          onConfirm={() => {
            if (submitConfirmation === "save") {
              const ok = onSubmit();
              if (ok !== false) setSubmitConfirmation(null);
            } else {
              const ok = onSaveDraft?.();
              if (ok !== false) setSubmitConfirmation(null);
            }
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
