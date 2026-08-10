"use client";

import Link from "next/link";
import { ArrowLeft, FilePlus2, Save, Search } from "lucide-react";
import { CashAdvanceHref } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { CashAdvanceActionMode } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function CashAdvanceFormHeader({
  mode,
  onPreview,
  onSubmit,
}: {
  mode: CashAdvanceActionMode;
  onPreview: () => void;
  onSubmit: () => void;
}) {
  const title =
    mode === "view"
      ? "Cash Advance Preview"
      : mode === "edit"
        ? "Edit Cash Advance"
        : "New Cash Advance";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Record the payee, account, amount, and supporting details for a cash advance."
      actionsClassName="items-center"
      actions={
        <>
          <Link href={CashAdvanceHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Table
          </Link>
          <button type="button" className={moduleHeaderActionClassNames.secondary}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
          <ReportPreviewAction label="Preview PDF" onPreview={onPreview} />
          <Link
            href={`${CashAdvanceHref}/add`}
            className={moduleHeaderActionClassNames.secondary}
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            New
          </Link>
          <button
            type="button"
            className={moduleHeaderActionClassNames.primary}
            onClick={onSubmit}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save
          </button>
        </>
      }
    />
  );
}
