"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, Edit3, FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  AdvancesToSuppliersHref,
  AdvancesToSuppliersStatuses,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type { AdvancesToSuppliersActionPageState } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import type { AdvancesToSuppliersConfirmationAction } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AdvancesToSuppliersActionHistory } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersActionHistory";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function AdvancesToSuppliersActionHeader({ onPreview, page }: { onPreview: () => void; page: AdvancesToSuppliersActionPageState }) {
  const [confirmation, setConfirmation] = useState<AdvancesToSuppliersConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Advances to Suppliers"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        {page.mode === "view" ? "View" : "Edit"} Advances to Suppliers | {transactionNo}
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
          page.mode === "view" ? "Review supplier advance details and supporting files." : "Record a purchase-order advance for a supplier."
        }
        actions={
          <>
            <Link href={AdvancesToSuppliersHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <button type="button" onClick={onPreview} className={moduleHeaderActionClassNames.secondary}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
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
                <button
                  type="button"
                  onClick={() => setConfirmation("approve")}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                  Approve
                </button>
                <button type="button" onClick={() => setConfirmation("disapprove")} className={moduleHeaderActionClassNames.danger}>
                  <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                  Disapprove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmation("cancel")}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  <Ban className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
                <Link href={`${AdvancesToSuppliersHref}/edit/${page.record.id}`} className={moduleHeaderActionClassNames.primary}>
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Link>
              </>
            ) : null}
            {page.mode !== "view" ? (
              <ModuleSaveButton
                label={page.mode === "edit" ? "Update" : "Save"}
                onSave={() => setConfirmation("save")}
                menuItems={page.mode === "add" ? [{ label: "Save As Draft", onSelect: () => setConfirmation("draft") }] : []}
              />
            ) : null}
          </>
        }
      />
      {confirmation ? (
        <AppDialog
          isOpen
          title={getDialogTitle(confirmation)}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={
            confirmation === "save"
              ? "Save and Submit"
              : confirmation === "draft"
                ? "Save as Draft"
                : confirmation.charAt(0).toUpperCase() + confirmation.slice(1)
          }
          tone={
            confirmation === "approve" || confirmation === "save"
              ? "success"
              : confirmation === "disapprove" || confirmation === "cancel"
                ? "danger"
                : "default"
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            if (confirmation === "save") page.save(AdvancesToSuppliersStatuses.forApproval);
            else if (confirmation === "draft") page.save(AdvancesToSuppliersStatuses.draft);
            else if (confirmation === "approve") page.updateStatus(AdvancesToSuppliersStatuses.posted);
            else if (confirmation === "disapprove") page.updateStatus(AdvancesToSuppliersStatuses.disapproved);
            else page.updateStatus(AdvancesToSuppliersStatuses.cancelled);
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}

function getDialogTitle(action: AdvancesToSuppliersConfirmationAction) {
  if (action === "save") return "Save advances to suppliers?";
  if (action === "draft") return "Save as draft?";
  return `${action.charAt(0).toUpperCase() + action.slice(1)} advances to suppliers?`;
}
