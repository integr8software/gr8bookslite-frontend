import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  CashAdvanceMultipleEntryHref,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { createCashAdvanceMultipleEntryApprovalRecord } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { useCashAdvanceMultipleEntryActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import { CashAdvanceViewActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceViewActions";
import { CashAdvanceMultipleEntryActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryActionHistory";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

export function CashAdvanceMultipleEntryActionHeader({
  mode,
  onPreview,
  onSaveDraft,
  onSubmit,
  onUpdateStatus,
  record,
}: {
  mode: CashAdvanceMultipleEntryActionMode;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onUpdateStatus: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateEntryStatus"];
  record: CashAdvanceMultipleEntryRecord | null;
}) {
  const titleLabel =
    mode === "view"
      ? `View Cash Advance Multiple Entry${record?.transNo ? ` | ${record.transNo}` : ""}`
      : mode === "edit"
        ? `Edit Cash Advance Multiple Entry${record?.transNo ? ` | ${record.transNo}` : ""}`
        : "Add Cash Advance Multiple Entry";
  const title = (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{titleLabel}</span>
      {record?.status ? <ModuleStatusBadge status={record.status} /> : null}
    </span>
  );
  const approvalRecord = createCashAdvanceMultipleEntryApprovalRecord(record);

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Record party-level cash advances with entries, accounting, approvals, and attachments."
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link href={CashAdvanceMultipleEntryHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
          {mode !== "add" ? <CashAdvanceMultipleEntryActionHistory record={record} /> : null}
          {mode !== "add" ? (
            <CashAdvanceViewActions record={approvalRecord} onUpdateStatus={onUpdateStatus} />
          ) : null}
          {mode === "view" ? null : (
            <ModuleSaveButton
              onSave={onSubmit}
              menuItems={
                mode === "add" && onSaveDraft
                  ? [
                      {
                        label: "Save As Draft",
                        onSelect: onSaveDraft,
                      },
                    ]
                  : []
              }
            />
          )}
        </>
      }
    />
  );
}
