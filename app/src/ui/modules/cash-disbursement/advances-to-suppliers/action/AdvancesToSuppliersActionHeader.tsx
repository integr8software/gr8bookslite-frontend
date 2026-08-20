"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Edit3, FileText } from "lucide-react";
import {
  AdvancesToSuppliersConfirmationDialogTitles,
  AdvancesToSuppliersConfirmationDialogConfirmLabels,
  AdvancesToSuppliersLink,
  AdvancesToSuppliersStatuses,
  canEditAdvancesToSuppliers,
  getAdvancesToSuppliersEditLink,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type { AdvancesToSuppliersActionPageState } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AdvancesToSuppliersConfirmationAction } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AdvancesToSuppliersActionHistory } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersActionHistory";
import { AdvancesToSuppliersStatusActions } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
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
            <Link href={AdvancesToSuppliersLink} className={moduleHeaderActionClassNames.secondary}>
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
                label={page.isSubmitting ? "Saving..." : page.mode === "edit" ? "Update" : "Save Advances to Supplier"}
                onAction={() => setConfirmation("save")}
                menuItems={page.mode === "add" ? [{ label: "Save As Draft", onSelect: () => setConfirmation("draft") }] : []}
              />
            ) : null}
          </>
        }
      />
      {confirmation ? (
        <AppDialog
          isOpen
          title={AdvancesToSuppliersConfirmationDialogTitles[confirmation]}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={AdvancesToSuppliersConfirmationDialogConfirmLabels[confirmation]}
          iconTone={confirmation === "save" ? (page.mode === "edit" ? "update" : "save") : confirmation === "draft" ? "save" : undefined}
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
