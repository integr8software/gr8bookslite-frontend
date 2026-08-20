"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, FileText } from "lucide-react";
import {
  RevolvingFundReplenishmentConfirmationDialogConfirmLabels,
  RevolvingFundReplenishmentConfirmationDialogTitles,
  RevolvingFundReplenishmentLink,
  RevolvingFundReplenishmentStatuses,
  canEditRevolvingFundReplenishment,
  getRevolvingFundReplenishmentEditLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { RevolvingFundReplenishmentConfirmationAction } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentActionHistory } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentActionHistory";
import { RevolvingFundReplenishmentStatusActions } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function RevolvingFundReplenishmentActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: RevolvingFundReplenishmentActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<RevolvingFundReplenishmentConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Revolving Fund Replenishment"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        {page.mode === "view" ? "View" : "Edit"} Revolving Fund Replenishment | {transactionNo}
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
            ? "Review replenishment details, entries, and supporting files."
            : "Prepare revolving fund voucher entries for fund replenishment."
        }
        actions={
          <>
            <Link href={RevolvingFundReplenishmentLink} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <button type="button" onClick={onPreview} className={moduleHeaderActionClassNames.secondary}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
            {page.mode !== "add" ? <RevolvingFundReplenishmentActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <RevolvingFundReplenishmentStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditRevolvingFundReplenishment(page.record.status) ? (
                  <Link href={getRevolvingFundReplenishmentEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                ) : null}
              </>
            ) : null}
            {page.mode !== "view" ? (
              <ModuleActionButton
                disabled={page.isSubmitting}
                label={page.isSubmitting ? "Saving..." : page.mode === "edit" ? "Update" : "Save"}
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
          title={RevolvingFundReplenishmentConfirmationDialogTitles[confirmation]}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={RevolvingFundReplenishmentConfirmationDialogConfirmLabels[confirmation]}
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
            if (confirmation === "save") page.save(RevolvingFundReplenishmentStatuses.forApproval);
            else if (confirmation === "draft") page.save(RevolvingFundReplenishmentStatuses.draft);
            else if (confirmation === "approve") page.updateStatus(RevolvingFundReplenishmentStatuses.posted);
            else if (confirmation === "disapprove") page.updateStatus(RevolvingFundReplenishmentStatuses.disapproved);
            else page.updateStatus(RevolvingFundReplenishmentStatuses.cancelled);
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
