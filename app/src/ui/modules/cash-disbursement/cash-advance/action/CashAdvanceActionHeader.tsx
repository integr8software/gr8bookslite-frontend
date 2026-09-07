"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  CashAdvanceLink,
  CashAdvanceStatuses,
  canEditCashAdvanceStatus,
  getCashAdvanceEditLink,
  CashAdvanceSubmitConfirmationDialogConfirmLabels,
  CashAdvanceSubmitConfirmationDialogTitles,
  getCashAdvanceStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceRecord,
  CashAdvanceStatus,
  CashAdvanceSubmitConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { CashAdvanceActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHistory";
import { CashAdvanceStatusActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceStatusActions";

export function CashAdvanceActionHeader({
  availabilityWarning,
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
  availabilityWarning?: string | null;
  mode: CashAdvanceActionMode;
  hasDiscardableChanges: boolean;
  isSubmitting?: boolean;
  onBack?: () => void;
  onDiscard?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => boolean | void;
  onSubmit: () => boolean | void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  onValidate?: (status?: CashAdvanceStatus) => boolean;
  record?: CashAdvanceRecord | null;
}) {
  const [submitConfirmation, setSubmitConfirmation] = useState<CashAdvanceSubmitConfirmationAction | null>(null);
  const [isAvailabilityWarningOpen, setIsAvailabilityWarningOpen] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record?.transNo ?? "this cash advance";
  const isDraftEdit = mode === "edit" && record?.status === CashAdvanceStatuses.Draft;
  const isSaveAction = mode === "add" || isDraftEdit;
  const statusDialogCopy = statusToConfirm ? getCashAdvanceStatusDialogCopy(statusToConfirm, recordLabel, record?.status) : null;
  const title =
    mode === "add" ? (
      "Add Cash Advance"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {mode === "view" ? "View" : "Edit"} Cash Advance | {recordLabel}
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
        description="Record the payee, account, amount, and supporting details for a cash advance."
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={CashAdvanceLink} className={moduleHeaderActionClassNames.secondary} onClick={onBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {mode !== "view" && onDiscard ? (
              <ModuleDraftDiscardAction
                hasChanges={hasDiscardableChanges}
                href={CashAdvanceLink}
                mode={mode}
                onDiscard={onDiscard}
              />
            ) : null}
            {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
            {mode !== "add" ? <CashAdvanceActionHistory record={record} /> : null}
            {mode !== "add" ? (
              <CashAdvanceStatusActions record={record} onRequestStatusConfirmation={setStatusToConfirm} onUpdateStatus={onUpdateStatus} />
            ) : null}
            {mode === "view" && record && canEditCashAdvanceStatus(record.status) ? (
              <Link href={getCashAdvanceEditLink(record.id)} className={moduleHeaderActionClassNames.primary}>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            ) : null}
            {mode === "view" ? null : (
              <ModuleActionButton
                disabled={isSubmitting}
                label={isSaveAction ? "Save" : "Update"}
                onAction={() => {
                  if (onValidate ? onValidate(CashAdvanceStatuses.ForApproval) : true) {
                    if (availabilityWarning) {
                      setIsAvailabilityWarningOpen(true);
                    } else {
                      setSubmitConfirmation("save");
                    }
                  }
                }}
                menuItems={
                  isSaveAction && onSaveDraft
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (onValidate ? onValidate(CashAdvanceStatuses.Draft) : true) {
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
              ? "Update Cash Advance?"
              : CashAdvanceSubmitConfirmationDialogTitles[submitConfirmation]
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
              : CashAdvanceSubmitConfirmationDialogConfirmLabels[submitConfirmation]
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
      <AppDialog
        confirmLabel="Save Anyway"
        description={`${availabilityWarning ?? "This Cash Advance exceeds the configured amount."} Do you want to save this transaction anyway?`}
        iconTone="warning"
        isOpen={isAvailabilityWarningOpen}
        isPending={isSubmitting}
        pendingLabel={isSaveAction ? "Saving..." : "Updating..."}
        title="Cash Advance Amount Exceeds Available Amount"
        tone="warning"
        onCancel={() => setIsAvailabilityWarningOpen(false)}
        onConfirm={() => {
          setIsAvailabilityWarningOpen(false);
          onSubmit();
        }}
      />
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
            if (statusToConfirm) onUpdateStatus?.(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
