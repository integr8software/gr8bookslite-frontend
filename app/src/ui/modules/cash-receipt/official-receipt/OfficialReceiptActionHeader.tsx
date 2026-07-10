import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  OfficialReceiptCopyFromRecords,
  OfficialReceiptCopySources,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import { OfficialReceiptHref } from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import type {
  OfficialReceiptActionMode,
  OfficialReceiptFormValues,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type OfficialReceiptActionHeaderProps = {
  mode: OfficialReceiptActionMode;
  values: OfficialReceiptFormValues;
  onCopyFrom: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
};

export function OfficialReceiptActionHeader({
  mode,
  onCopyFrom,
  onPreview,
  onSubmit,
  values,
}: OfficialReceiptActionHeaderProps) {
  const title =
    mode === "view"
      ? `View Official Receipt | ${values.receiptNo}`
      : mode === "edit"
        ? `Edit Official Receipt | ${values.receiptNo}`
        : "Add Official Receipt";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.referenceNo || "Official receipt"}
      title={title}
      description={
        mode === "view"
          ? "Review receipt details, payment information, and accounting entries."
          : "Complete the receipt header and accounting entries on one page before saving."
      }
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link href={OfficialReceiptHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ReportPreviewAction onPreview={onPreview} />
          {mode === "view" ? null : (
            <>
              <Link href={OfficialReceiptHref} className={moduleHeaderActionClassNames.secondary}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
              <AppCopyFromDropdown
                records={OfficialReceiptCopyFromRecords}
                sources={OfficialReceiptCopySources}
                onApply={onCopyFrom}
              />
              <button
                type="button"
                onClick={onSubmit}
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          )}
        </>
      }
    />
  );
}
