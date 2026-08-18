"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, Edit3, FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  PettyCashFundHref,
  PettyCashFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import type { PettyCashFundConfirmationAction } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHistory";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
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
            <Link href={PettyCashFundHref} className={moduleHeaderActionClassNames.secondary}>
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
                <Link href={`${PettyCashFundHref}/edit/${page.record.id}`} className={moduleHeaderActionClassNames.primary}>
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
          description={getDialogDescription(confirmation, transactionNo)}
          confirmLabel={getConfirmLabel(confirmation)}
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

function getDialogTitle(action: PettyCashFundConfirmationAction) {
  return action === "save"
    ? "Save petty cash fund?"
    : action === "draft"
      ? "Save as draft?"
      : action === "approve"
        ? "Approve petty cash fund?"
        : action === "disapprove"
          ? "Disapprove petty cash fund?"
          : "Cancel petty cash fund?";
}
function getDialogDescription(action: PettyCashFundConfirmationAction, recordLabel: string) {
  return `This will ${action === "save" ? "save and submit" : action} ${recordLabel}.`;
}
function getConfirmLabel(action: PettyCashFundConfirmationAction) {
  return action === "save" ? "Save and Submit" : action === "draft" ? "Save as Draft" : action.charAt(0).toUpperCase() + action.slice(1);
}
