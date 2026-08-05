import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";
import {
  ReceivingReportHref,
  ReceivingReportOverflowItems,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ReceivingReportListHeaderActions() {
  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          className="[&>button]:h-10 [&>button]:w-10"
          items={ReceivingReportOverflowItems}
          label="Receiving Report actions"
        />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <button type="button" className={moduleHeaderActionClassNames.secondary}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload
        </button>
        <button type="button" className={moduleHeaderActionClassNames.secondary}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </button>
      </div>
      <Link
        href={`${ReceivingReportHref}/add`}
        className={moduleHeaderActionClassNames.primary}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start New Receiving Report
      </Link>
    </>
  );
}
