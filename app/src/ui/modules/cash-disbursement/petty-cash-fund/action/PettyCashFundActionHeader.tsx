"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, FileText } from "lucide-react";
import {
  PettyCashFundConfirmationDialogConfirmLabels,
  PettyCashFundConfirmationDialogTitles,
  PettyCashFundLink,
  PettyCashFundStatuses,
  canEditPettyCashFund,
  getPettyCashFundEditLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { PettyCashFundConfirmationAction } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHistory";
import { PettyCashFundStatusActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundStatusActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function PettyCashFundActionHeader({ onPreview, page }: { onPreview: () => void; page: PettyCashFundActionPageState }) {
  const [confirmation, setConfirmation] = useState<PettyCashFundConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Petty Cash Fund"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        {page.mode === "view" ? "View" : "Edit"} Petty Cash Fund | {transactionNo}
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
            : "Set up a custodian, default account, and petty cash transactions."
        }
        actions={
          <>
            <Link href={PettyCashFundLink} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <button type="button" onClick={onPreview} className={moduleHeaderActionClassNames.secondary}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
            {page.mode !== "add" ? <PettyCashFundActionHistory record={page.record} /> : null}
            {page.mode === "view" && page.record ? (
              <>
                <PettyCashFundStatusActions record={page.record} onRequestConfirmation={setConfirmation} />
                {canEditPettyCashFund(page.record.status) ? (
                  <Link href={getPettyCashFundEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
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
          title={PettyCashFundConfirmationDialogTitles[confirmation]}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={PettyCashFundConfirmationDialogConfirmLabels[confirmation]}
          iconTone={confirmation === "save" ? (page.mode === "edit" ? "update" : "save") : confirmation === "draft" ? "save" : undefined}
          pendingLabel="Saving..."
          tone={
            confirmation === "approve" || confirmation === "save"
              ? "success"
              : confirmation === "disapprove" || confirmation === "cancel"
                ? "danger"
                : "default"
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            if (confirmation === "save") page.save(PettyCashFundStatuses.forApproval);
            else if (confirmation === "draft") page.save(PettyCashFundStatuses.draft);
            else if (confirmation === "approve") page.updateStatus(PettyCashFundStatuses.posted);
            else if (confirmation === "disapprove") page.updateStatus(PettyCashFundStatuses.disapproved);
            else page.updateStatus(PettyCashFundStatuses.cancelled);
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
