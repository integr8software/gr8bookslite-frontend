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
  CashAdvanceFormController,
  CashAdvanceRecord,
  CashAdvanceSubmitConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceStatusActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceStatusActions";
import { CashAdvanceActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHistory";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

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
  onUpdateStatus: CashAdvanceFormController["updateEntryStatus"];
  onValidate?: (status?: CashAdvanceStatus) => boolean;
  record: CashAdvanceRecord | null;
}) {
  const [submitConfirmation, setSubmitConfirmation] = useState<CashAdvanceSubmitConfirmationAction | null>(null);
  const [isAvailabilityWarningOpen, setIsAvailabilityWarningOpen] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record?.transNo ?? "this cash advance";
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceStatusDialogCopy(statusToConfirm, recordLabel, record?.status)
    : null;
  const isDraftEdit = mode === "edit" && record?.status === CashAdvanceStatuses.Draft;
  const isSaveAction = mode === "add" || isDraftEdit;
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

  const handleSaveClick = () => {
    const targetStatus = isSaveAction ? CashAdvanceStatuses.ForApproval : undefined;
    if (onValidate && !onValidate(targetStatus)) {
      return;
    }
    if (availabilityWarning) {
      setIsAvailabilityWarningOpen(true);
      return;
    }
    setSubmitConfirmation("save");
  };

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
            {mode === "view" && record && canEditCashAdvanceStatus(record.status) ? (
              <Link href={getCashAdvanceEditLink(record.id)} className={moduleHeaderActionClassNames.secondary}>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            ) : null}
            {record ? (
              <CashAdvanceActionHistory record={record} />
            ) : null}
            {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
            {mode !== "view" ? (
              <ModuleActionButton
                disabled={isSubmitting}
                label={isSaveAction ? "Save" : "Update"}
                onAction={handleSaveClick}
                menuItems={
                  isSaveAction && onSaveDraft
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (onValidate && !onValidate(CashAdvanceStatuses.Draft)) {
                              return;
                            }
                            setSubmitConfirmation("draft");
                          },
                        },
                      ]
                    : []
                }
              />
            ) : null}
            {mode === "view" && record ? (
              <CashAdvanceStatusActions
                record={record}
                onRequestStatusConfirmation={setStatusToConfirm}
                onUpdateStatus={onUpdateStatus}
              />
            ) : null}
          </>
        }
      />

      {submitConfirmation ? (
        <AppDialog
          isOpen
          title={CashAdvanceSubmitConfirmationDialogTitles[submitConfirmation]}
          description={
            submitConfirmation === "save"
              ? "Are you sure you want to save this cash advance for approval?"
              : "Are you sure you want to save this cash advance as draft?"
          }
          confirmLabel={CashAdvanceSubmitConfirmationDialogConfirmLabels[submitConfirmation]}
          cancelLabel="Cancel"
          iconTone={submitConfirmation === "save" ? "save" : "question"}
          isPending={isSubmitting}
          tone="default"
          onConfirm={() => {
            const action = submitConfirmation;
            setSubmitConfirmation(null);
            if (action === "save") {
              onSubmit();
            } else if (onSaveDraft) {
              onSaveDraft();
            }
          }}
          onCancel={() => setSubmitConfirmation(null)}
        />
      ) : null}

      {isAvailabilityWarningOpen ? (
        <AppDialog
          isOpen
          title="Available Cash Advance Warning"
          description={`${availabilityWarning ?? ""} Do you still want to proceed with saving?`}
          confirmLabel="Proceed"
          cancelLabel="Cancel"
          tone="warning"
          onConfirm={() => {
            setIsAvailabilityWarningOpen(false);
            setSubmitConfirmation("save");
          }}
          onCancel={() => setIsAvailabilityWarningOpen(false)}
        />
      ) : null}

      {statusDialogCopy ? (
        <AppDialog
          isOpen={statusToConfirm !== null}
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          confirmLabel={statusDialogCopy.confirmLabel}
          cancelLabel="Cancel"
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onConfirm={() => {
            if (!statusToConfirm) return;
            const targetStatus = statusToConfirm;
            setStatusToConfirm(null);
            onUpdateStatus(targetStatus);
          }}
          onCancel={() => setStatusToConfirm(null)}
        />
      ) : null}
    </>
  );
}
