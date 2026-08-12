import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { CashAdvanceMultipleEntryHref } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { createCashAdvanceMultipleEntryApprovalRecord } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { useCashAdvanceMultipleEntryActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import {
  CashAdvanceHistoryButton,
  CashAdvanceViewActions,
} from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceViewActions";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";

export function CashAdvanceMultipleEntryHeader({
  mode,
  onSubmit,
  onUpdateStatus,
  record,
  visibilityAction,
}: {
  mode: CashAdvanceMultipleEntryActionMode;
  onSubmit: () => void;
  onUpdateStatus: ReturnType<typeof useCashAdvanceMultipleEntryActionForm>["updateEntryStatus"];
  record: CashAdvanceMultipleEntryRecord | null;
  visibilityAction: ReactNode;
}) {
  const title =
    mode === "view"
      ? "View Cash Advance Multiple Entry"
      : mode === "edit"
        ? "Edit Cash Advance Multiple Entry"
        : "Add Cash Advance Multiple Entry";
  const approvalRecord = createCashAdvanceMultipleEntryApprovalRecord(record);

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Record party-level cash advances with multiple entry lines, accounting entries, approvals, and file attachments."
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link href={CashAdvanceMultipleEntryHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode !== "add" ? <CashAdvanceHistoryButton record={approvalRecord} /> : null}
          {mode !== "add" ? (
            <CashAdvanceViewActions record={approvalRecord} onUpdateStatus={onUpdateStatus} />
          ) : null}
          {visibilityAction}
          {mode === "view" ? null : <ModuleSaveButton onSave={onSubmit} />}
        </>
      }
    />
  );
}
