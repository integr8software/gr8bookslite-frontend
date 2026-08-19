"use client";

import Link from "next/link";
import {
  useState } from "react";
import { ArrowLeft,
  Ban,
  Edit3,
  FileText,
  ThumbsDown,
  ThumbsUp } from "lucide-react";
import {
  PettyCashFundReplenishmentConfirmationDialogConfirmLabels,
  PettyCashFundReplenishmentConfirmationDialogTitles,
  PettyCashFundReplenishmentLink,
  PettyCashFundReplenishmentStatuses,
  getPettyCashFundReplenishmentEditLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type { PettyCashFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentActionPage";
import type { PettyCashFundReplenishmentConfirmationAction } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { PettyCashFundReplenishmentActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/action/PettyCashFundReplenishmentActionHistory";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function PettyCashFundReplenishmentActionHeader({
  onPreview,
  page,
}: {
  onPreview: () => void;
  page: PettyCashFundReplenishmentActionPageState;
}) {
  const [confirmation, setConfirmation] = useState<PettyCashFundReplenishmentConfirmationAction | null>(null);
  const transactionNo = page.record?.transactionNo ?? page.values.transactionNo;
  const title =
    page.mode === "add" ? (
      "Add Petty Cash Fund Replenishment"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        {page.mode === "view" ? "View" : "Edit"} Petty Cash Fund Replenishment | {transactionNo}
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
            : "Prepare petty cash voucher entries for fund replenishment."
        }
        actions={
          <>
            <Link href={PettyCashFundReplenishmentLink} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <button type="button" onClick={onPreview} className={moduleHeaderActionClassNames.secondary}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
            {page.mode !== "add" ? <PettyCashFundReplenishmentActionHistory record={page.record} /> : null}
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
                <Link href={getPettyCashFundReplenishmentEditLink(page.record.id)} className={moduleHeaderActionClassNames.primary}>
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Link>
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
          title={PettyCashFundReplenishmentConfirmationDialogTitles[confirmation]}
          description={`This will ${confirmation === "save" ? "save and submit" : confirmation} ${transactionNo}.`}
          confirmLabel={PettyCashFundReplenishmentConfirmationDialogConfirmLabels[confirmation]}
          tone={
            confirmation === "approve" || confirmation === "save"
              ? "success"
              : confirmation === "disapprove" || confirmation === "cancel"
                ? "danger"
                : "default"
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            if (confirmation === "save") page.save(PettyCashFundReplenishmentStatuses.forApproval);
            else if (confirmation === "draft") page.save(PettyCashFundReplenishmentStatuses.draft);
            else if (confirmation === "approve") page.updateStatus(PettyCashFundReplenishmentStatuses.posted);
            else if (confirmation === "disapprove") page.updateStatus(PettyCashFundReplenishmentStatuses.disapproved);
            else page.updateStatus(PettyCashFundReplenishmentStatuses.cancelled);
            setConfirmation(null);
          }}
        />
      ) : null}
    </>
  );
}
