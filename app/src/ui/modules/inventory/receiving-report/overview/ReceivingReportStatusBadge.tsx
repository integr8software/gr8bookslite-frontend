import type { ReceivingReportStatus } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";
import {
  receivingReportStatusClassNameByStatus,
  receivingReportStatusIconByStatus,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ReceivingReportStatusBadge({
  status,
}: {
  status: ReceivingReportStatus;
}) {
  const Icon = receivingReportStatusIconByStatus[status];

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        receivingReportStatusClassNameByStatus[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
