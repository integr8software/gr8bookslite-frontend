import Link from "next/link";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import {
  AcknowledgementReceiptCopyFromRecords,
  AcknowledgementReceiptCopySources,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import { AcknowledgementReceiptHref } from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import type {
  AcknowledgementReceiptActionMode,
  AcknowledgementReceiptCopyFromRecord,
  AcknowledgementReceiptFormValues,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type AcknowledgementReceiptActionHeaderProps = {
  copyFromRecords?: AcknowledgementReceiptCopyFromRecord[];
  copyFromSources?: string[];
  mode: AcknowledgementReceiptActionMode;
  recordId?: string;
  values: AcknowledgementReceiptFormValues;
  onCopyFrom: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
};

export function AcknowledgementReceiptActionHeader({
  copyFromRecords = AcknowledgementReceiptCopyFromRecords,
  copyFromSources = AcknowledgementReceiptCopySources,
  mode,
  onCopyFrom,
  onPreview,
  onSubmit,
  recordId,
  values,
}: AcknowledgementReceiptActionHeaderProps) {
  const title =
    mode === "view"
      ? `View Acknowledgement Receipt | ${values.receiptNo}`
      : mode === "edit"
        ? `Edit Acknowledgement Receipt | ${values.receiptNo}`
        : "Add Acknowledgement Receipt";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.referenceNo || "Acknowledgement Receipt"}
      title={title}
      description={
        mode === "view"
          ? "Review receipt details, payment information, and accounting entries."
          : "Complete the receipt header and accounting entries on one page before saving."
      }
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link href={AcknowledgementReceiptHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ReportPreviewAction onPreview={onPreview} />
          {mode === "view" && recordId && values.status === "Draft" ? (
            <Link href={`${AcknowledgementReceiptHref}/edit/${recordId}`} className={moduleHeaderActionClassNames.primary}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          {mode === "view" ? null : (
            <>
              <Link href={AcknowledgementReceiptHref} className={moduleHeaderActionClassNames.secondary}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
              <AppCopyFromDropdown
                records={copyFromRecords}
                sources={copyFromSources}
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
