import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  SalesInvoiceHref,
  SalesInvoiceTitle,
} from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import type {
  SalesInvoiceActionMode,
  SalesInvoiceFormValues,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type SalesInvoiceActionHeaderProps = {
  copyFromRecords: AppCopyFromRecord[];
  mode: SalesInvoiceActionMode;
  onCopyFromDeliveryReceipt: (recordIds: string[]) => void;
  values: SalesInvoiceFormValues;
  onPreview: () => void;
  onSubmit: () => void;
};

export function SalesInvoiceActionHeader({
  copyFromRecords,
  mode,
  onCopyFromDeliveryReceipt,
  onPreview,
  onSubmit,
  values,
}: SalesInvoiceActionHeaderProps) {
  const title =
    mode === "view"
      ? `View ${SalesInvoiceTitle} | ${values.transNo}`
      : mode === "edit"
        ? `Edit ${SalesInvoiceTitle} | ${values.transNo}`
        : `Add ${SalesInvoiceTitle}`;

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.referenceNo || SalesInvoiceTitle}
      title={title}
      description={
        mode === "view"
          ? "Review sales invoice customer, document, and item details."
          : "Complete the sales invoice header and item entries on one page before saving."
      }
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link href={SalesInvoiceHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ReportPreviewAction onPreview={onPreview} />
          {mode === "view" ? null : (
            <>
              <AppCopyFromDropdown
                records={copyFromRecords}
                sources={["Delivery Receipt"]}
                onApply={onCopyFromDeliveryReceipt}
              />
              <Link href={SalesInvoiceHref} className={moduleHeaderActionClassNames.secondary}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
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
