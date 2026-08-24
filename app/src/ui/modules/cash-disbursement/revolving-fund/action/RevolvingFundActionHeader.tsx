"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, FileText } from "lucide-react";
import {
  RevolvingFundConfirmationDialogConfirmLabels,
  RevolvingFundConfirmationDialogTitles,
  RevolvingFundLink,
  RevolvingFundStatuses,
  canEditRevolvingFund,
  getRevolvingFundEditLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { RevolvingFundConfirmationAction } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundActionHistory } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionHistory";
import { RevolvingFundStatusActions } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function RevolvingFundActionHeader({ onPreview, page }: { onPreview: () => void; page: RevolvingFundActionPageState }) {
  const [confirmation, setConfirmation] = useState<RevolvingFundConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Revolving Fund"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        {page.mode === "view" ? "View" : "Edit"} Revolving Fund | {transactionNo}
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
            ? "Review the fund details, entries, and supporting files."
            : "Set up a custodian, default account, and revolving fund transactions."
        }
        actions={
          <>
            <Link href={RevolvingFundLink} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <button type="button" onClick={onPreview} className={moduleHeaderActionClassNames.secondary}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
            {page.mode !== "add" ? <RevolvingFundActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <RevolvingFundStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditRevolvingFund(page.record.status) ? (
                  <Link href={getRevolvingFundEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
          title={RevolvingFundConfirmationDialogTitles[confirmation]}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={RevolvingFundConfirmationDialogConfirmLabels[confirmation]}
          iconTone={confirmation === "save" ? (page.mode === "edit" ? "update" : "save") : confirmation === "draft" ? "save" : undefined}
          pendingLabel="Saving..."
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
            if (confirmation === "save") page.save(RevolvingFundStatuses.forApproval);
            else if (confirmation === "draft") page.save(RevolvingFundStatuses.draft);
            else if (confirmation === "approve") page.updateStatus(RevolvingFundStatuses.posted);
            else if (confirmation === "disapprove") page.updateStatus(RevolvingFundStatuses.disapproved);
            else page.updateStatus(RevolvingFundStatuses.cancelled);
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
