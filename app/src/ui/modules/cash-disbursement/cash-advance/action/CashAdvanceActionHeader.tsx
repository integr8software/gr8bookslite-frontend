"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CashAdvanceHref } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceActionMode,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { CashAdvanceActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHistory";
import { CashAdvanceViewActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceViewActions";

export function CashAdvanceActionHeader({
  mode,
  onPreview,
  onSaveDraft,
  onSubmit,
  onUpdateStatus,
  record,
}: {
  mode: CashAdvanceActionMode;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const titleLabel =
    mode === "view"
      ? `View Cash Advance${record?.transNo ? ` | ${record.transNo}` : ""}`
      : mode === "edit"
        ? `Edit Cash Advance${record?.transNo ? ` | ${record.transNo}` : ""}`
        : "Add Cash Advance";
  const title = (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{titleLabel}</span>
      {record?.status ? <ModuleStatusBadge status={record.status} /> : null}
    </span>
  );

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Record the payee, account, amount, and supporting details for a cash advance."
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link href={CashAdvanceHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
          {mode !== "add" ? <CashAdvanceActionHistory record={record} /> : null}
          {mode !== "add" ? (
            <CashAdvanceViewActions record={record} onUpdateStatus={onUpdateStatus} />
          ) : null}
          {mode === "view" ? null : (
            <ModuleSaveButton
              onSave={onSubmit}
              menuItems={
                onSaveDraft
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
