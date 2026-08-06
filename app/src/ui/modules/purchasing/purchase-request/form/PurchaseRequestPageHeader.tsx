import Link from "next/link";
import { ArrowLeft, FileText, Save } from "lucide-react";
import {
  PurchaseRequestFormPageCopy,
  PurchaseRequestHref,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { PurchaseRequestMaterialPlanRecords } from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type {
  PurchaseRequestFormMode,
  PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type PurchaseRequestFormHeaderProps = {
  existingRequestId?: string;
  isSubmitting?: boolean;
  mode: PurchaseRequestFormMode;
  values: PurchaseRequestFormValues;
  onCopyFromSource: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
};

export function PurchaseRequestFormHeader({
  existingRequestId,
  isSubmitting = false,
  mode,
  onCopyFromSource,
  onPreview,
  onSubmit,
  values,
}: PurchaseRequestFormHeaderProps) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={getTitle(mode, values.transNo)}
      description={PurchaseRequestFormPageCopy[mode].description}
      eyebrow={
        <>
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Purchasing document
        </>
      }
      actions={
        <>
          <Link href={PurchaseRequestHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ReportPreviewAction onPreview={onPreview} />
          {mode === "view" ? (
            <Link
              href={`${PurchaseRequestHref}/edit/${existingRequestId ?? ""}`}
              className={moduleHeaderActionClassNames.primary}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : (
            <>
              <AppCopyFromDropdown
                records={PurchaseRequestMaterialPlanRecords}
                sources={["Material Plan", "Sales Order"]}
                onApply={onCopyFromSource}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSubmit}
                className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </>
      }
    />
  );
}

function getTitle(mode: PurchaseRequestFormMode, transNo: string) {
  if (mode === "add") return PurchaseRequestFormPageCopy.add.title;
  if (mode === "edit") return `${PurchaseRequestFormPageCopy.edit.title} ${transNo}`;

  return `${PurchaseRequestFormPageCopy.view.title} ${transNo}`;
}
