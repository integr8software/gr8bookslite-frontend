import Link from "next/link";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import {
  ProvisionalReceiptCopyFromRecords,
  ProvisionalReceiptCopySources,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import type {
  ProvisionalReceiptActionMode,
  ProvisionalReceiptCopyFromRecord,
  ProvisionalReceiptFormValues,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type ProvisionalReceiptActionHeaderProps = {
  baseHref: string;
  copyFromRecords?: ProvisionalReceiptCopyFromRecord[];
  copyFromSources?: string[];
  mode: ProvisionalReceiptActionMode;
  recordId?: string;
  receiptLabel?: string;
  values: ProvisionalReceiptFormValues;
  onCopyFrom: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
};

export function ProvisionalReceiptActionHeader({
  baseHref,
  copyFromRecords = ProvisionalReceiptCopyFromRecords,
  copyFromSources = ProvisionalReceiptCopySources,
  mode,
  onCopyFrom,
  onPreview,
  onSubmit,
  recordId,
  receiptLabel = "Collection Receipt",
  values,
}: ProvisionalReceiptActionHeaderProps) {
  const title =
    mode === "view"
      ? `View ${receiptLabel} | ${values.receiptNo}`
      : mode === "edit"
        ? `Edit ${receiptLabel} | ${values.receiptNo}`
        : `Add ${receiptLabel}`;

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.referenceNo || receiptLabel}
      title={title}
      description={
        mode === "view"
          ? "Review receipt details, payment information, and accounting entries."
          : "Complete the receipt header and accounting entries on one page before saving."
      }
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link href={baseHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ReportPreviewAction onPreview={onPreview} />
          {mode === "view" && recordId && values.status === "Draft" ? (
            <Link href={`${baseHref}/edit/${recordId}`} className={moduleHeaderActionClassNames.primary}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          {mode === "view" ? null : (
            <>
              <Link href={baseHref} className={moduleHeaderActionClassNames.secondary}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
              <AppCopyFromDropdown records={copyFromRecords} sources={copyFromSources} onApply={onCopyFrom} />
              <button type="button" onClick={onSubmit} className={moduleHeaderActionClassNames.primary}>
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
