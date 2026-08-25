"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  CashAdvanceLink,
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
  mode,
  hasDiscardableChanges,
  isSubmitting,
  onBack,
  onDiscard,
  onPreview,
  onSaveDraft,
  onSubmit,
  onUpdateStatus,
  record,
}: {
  mode: CashAdvanceActionMode;
  hasDiscardableChanges: boolean;
  isSubmitting?: boolean;
  onBack?: () => void;
  onDiscard?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const [submitConfirmation, setSubmitConfirmation] = useState<CashAdvanceSubmitConfirmationAction | null>(null);
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record?.transNo ?? "this cash advance";
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
                label={isSubmitting ? "Saving..." : mode === "edit" ? "Update" : "Save"}
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
          title={CashAdvanceSubmitConfirmationDialogTitles[submitConfirmation]}
          description={`This will ${submitConfirmation === "save" ? "save and submit" : "save as draft"} ${recordLabel}.`}
          confirmLabel={CashAdvanceSubmitConfirmationDialogConfirmLabels[submitConfirmation]}
          iconTone={submitConfirmation === "save" ? (mode === "edit" ? "update" : "save") : "save"}
          pendingLabel="Saving..."
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
            if (statusToConfirm) onUpdateStatus?.(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
