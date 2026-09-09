"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  RequestForPaymentConfirmationDialogConfirmLabels,
  RequestForPaymentConfirmationDialogTitles,
  RequestForPaymentLink,
  RequestForPaymentStatuses,
  canEditRequestForPayment,
  getRequestForPaymentEditLink,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentActionPageState,
  RequestForPaymentConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { RequestForPaymentActionHistory } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentActionHistory";
import { RequestForPaymentStatusActions } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function RequestForPaymentActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: RequestForPaymentActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<RequestForPaymentConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Request for Payment"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Request for Payment | {transactionNo}
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
            ? "Review payment request details, line items, and file attachments."
            : "Set up payee details, schedule payment dates, and add request items."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={RequestForPaymentLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={RequestForPaymentLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode !== "add" ? <RequestForPaymentActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <RequestForPaymentStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditRequestForPayment(page.record.status) ? (
                  <Link href={getRequestForPaymentEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
                  if (page.validate(RequestForPaymentStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  page.mode === "add"
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(RequestForPaymentStatuses.draft)) {
                              setConfirmation("draft");
                            }
                          },
                        },
                      ]
                    : undefined
                }
              />
            ) : null}
          </>
        }
      />

      <AppDialog
        isOpen={confirmation !== null}
        title={confirmation ? RequestForPaymentConfirmationDialogTitles[confirmation] : ""}
        description="Are you sure you want to proceed with this action?"
        confirmLabel={confirmation ? RequestForPaymentConfirmationDialogConfirmLabels[confirmation] : "Confirm"}
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!confirmation) return;
          const action = confirmation;
          setConfirmation(null);

          if (action === "save") {
            await page.submitRecord(RequestForPaymentStatuses.forApproval);
          } else if (action === "draft") {
            await page.submitRecord(RequestForPaymentStatuses.draft);
          } else if (action === "approve") {
            await page.submitRecord(RequestForPaymentStatuses.approved);
          } else if (action === "disapprove") {
            await page.submitRecord(RequestForPaymentStatuses.disapproved);
          } else if (action === "cancel") {
            await page.submitRecord(RequestForPaymentStatuses.cancelled);
          }
        }}
        onCancel={() => setConfirmation(null)}
      />
    </>
  );
}
