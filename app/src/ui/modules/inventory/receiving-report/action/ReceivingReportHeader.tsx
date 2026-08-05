import Link from "next/link";
import { Boxes, Save } from "lucide-react";
import {
  ReceivingReportActionCopy,
  ReceivingReportHref,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import type { ReceivingReportActionMode } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportHeader({
  copyFromRecords,
  isReadonly,
  mode,
  onCopyFromPurchaseOrder,
  onPreview,
}: {
  copyFromRecords: AppCopyFromRecord[];
  isReadonly: boolean;
  mode: ReceivingReportActionMode;
  onCopyFromPurchaseOrder: (recordIds: string[]) => void;
  onPreview: () => void;
}) {
  const copy = ReceivingReportActionCopy[mode];

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={copy.title}
      description={copy.description}
      className="gap-2"
      descriptionClassName="mt-1 text-xs leading-5"
      eyebrow={
        <>
          <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
          Inventory transaction
        </>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href={ReceivingReportHref} className={moduleHeaderActionClassNames.secondary}>
            Back
          </Link>
          <ReportPreviewAction label="Preview" onPreview={onPreview} />
          {!isReadonly ? (
            <>
              <AppCopyFromDropdown
                records={copyFromRecords}
                sources={["Purchase Order"]}
                onApply={onCopyFromPurchaseOrder}
              />
              <button type="submit" className={moduleHeaderActionClassNames.primary}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          ) : null}
        </div>
      }
    />
  );
}
