import { PackageSearch } from "lucide-react";
import { ReceivingReportHref } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ReceivingReportNotFound() {
  return (
    <ModuleNotFound
      title="Receiving report not found"
      description="The receiving report may have been removed or the link is no longer valid."
      actionHref={ReceivingReportHref}
      actionLabel="Back to Receiving Reports"
      icon={<PackageSearch className="h-5 w-5" aria-hidden="true" />}
    />
  );
}
