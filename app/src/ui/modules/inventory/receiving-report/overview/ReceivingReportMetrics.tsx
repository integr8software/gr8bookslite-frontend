import { Boxes, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import {
  countReceivingReportsByStatus,
  formatReceivingReportCurrency,
  formatReceivingReportPercentage,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { ReceivingReportStatuses } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import type { ReceivingReportRecord } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ReceivingReportMetrics({
  records,
}: {
  records: ReceivingReportRecord[];
}) {
  const approvedCount = countReceivingReportsByStatus(records, ReceivingReportStatuses.approved);
  const draftCount = countReceivingReportsByStatus(records, ReceivingReportStatuses.draft);
  const pendingCount = countReceivingReportsByStatus(records, ReceivingReportStatuses.pending);
  const closedCount = countReceivingReportsByStatus(records, ReceivingReportStatuses.closed);
  const totalNet = records.reduce((sum, record) => sum + record.netAmount, 0);

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-5"
      items={[
        {
          label: "Total Reports",
          value: records.length,
          summary: "All time",
          icon: Boxes,
          iconClassName: "bg-skyblue/20 text-skyblue",
        },
        {
          label: ReceivingReportStatuses.draft,
          value: draftCount,
          summary: formatReceivingReportPercentage(draftCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: ReceivingReportStatuses.pending,
          value: pendingCount,
          summary: formatReceivingReportPercentage(pendingCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: ReceivingReportStatuses.approved,
          value: approvedCount,
          summary: formatReceivingReportPercentage(approvedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Total Net",
          value: formatReceivingReportCurrency(totalNet),
          summary: `${closedCount} closed`,
          icon: PackageCheck,
          iconClassName: "bg-skyblue/15 text-skyblue",
        },
      ]}
    />
  );
}
