"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  AdvancesToSuppliersConfirmationDialogTitles,
  AdvancesToSuppliersConfirmationDialogConfirmLabels,
  AdvancesToSuppliersLink,
  AdvancesToSuppliersStatuses,
  canEditAdvancesToSuppliers,
  getAdvancesToSuppliersEditLink,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type {
  AdvancesToSuppliersActionPageState,
  AdvancesToSuppliersConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AdvancesToSuppliersActionHistory } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersActionHistory";
import { AdvancesToSuppliersStatusActions } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function AdvancesToSuppliersActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: AdvancesToSuppliersActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<AdvancesToSuppliersConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Advances to Suppliers"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {page.mode === "view" ? "View" : "Edit"} Advances to Suppliers | {transactionNo}
        </span>
        <ModuleStatusBadge status={page.values.status} />
      </span>
    );

  return (
    <>
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description={
          page.mode === "view"
            ? "Review supplier advance details and supporting files."
            : "Record a purchase-order advance for a supplier."
        }
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={AdvancesToSuppliersLink} className={moduleHeaderActionClassNames.secondary} onClick={page.saveDraft}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {page.mode !== "view" ? (
              <ModuleDraftDiscardAction
                hasChanges={page.hasDiscardableChanges}
                href={AdvancesToSuppliersLink}
                mode={page.mode}
                onDiscard={page.discardDraft}
              />
            ) : null}
            <ReportPreviewAction onPreview={onPreview} />
            {page.mode === "add" ? (
              <AppCopyFromDropdown
                records={page.purchaseOrderCopyRecords}
                selectionMode="single"
                sources={["Purchase Order"]}
                onApply={page.copyFromPurchaseOrder}
              />
            ) : null}
            {page.mode !== "add" ? <AdvancesToSuppliersActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <AdvancesToSuppliersStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditAdvancesToSuppliers(page.record.status) ? (
                  <Link href={getAdvancesToSuppliersEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
                  if (page.validate(AdvancesToSuppliersStatuses.forApproval)) {
                    setConfirmation("save");
                  }
                }}
                menuItems={
                  page.mode === "add"
                    ? [
                        {
                          label: "Save As Draft",
                          onSelect: () => {
                            if (page.validate(AdvancesToSuppliersStatuses.draft)) {
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
              ? "Update Advances to Suppliers?"
              : AdvancesToSuppliersConfirmationDialogTitles[confirmation]
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
              : AdvancesToSuppliersConfirmationDialogConfirmLabels[confirmation]
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
              const ok = page.save(AdvancesToSuppliersStatuses.forApproval);
              if (ok) setConfirmation(null);
            } else if (confirmation === "draft") {
              const ok = page.save(AdvancesToSuppliersStatuses.draft);
              if (ok) setConfirmation(null);
            } else if (confirmation === "approve") {
              const ok = page.updateStatus(AdvancesToSuppliersStatuses.posted);
              if (ok) setConfirmation(null);
            } else if (confirmation === "disapprove") {
              const ok = page.updateStatus(AdvancesToSuppliersStatuses.disapproved);
              if (ok) setConfirmation(null);
            } else {
              const ok = page.updateStatus(AdvancesToSuppliersStatuses.cancelled);
              if (ok) setConfirmation(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
