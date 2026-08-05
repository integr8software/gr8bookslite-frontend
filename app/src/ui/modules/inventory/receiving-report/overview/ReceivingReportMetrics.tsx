import { Boxes, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import {
  countReceivingReportsByStatus,
  formatReceivingReportCurrency,
  formatReceivingReportPercentage,
  type ReceivingReportRecord,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ReceivingReportMetrics({
  records,
}: {
  records: ReceivingReportRecord[];
}) {
  const approvedCount = countReceivingReportsByStatus(records, "Approved");
  const draftCount = countReceivingReportsByStatus(records, "Draft");
  const pendingCount = countReceivingReportsByStatus(records, "Pending");
  const closedCount = countReceivingReportsByStatus(records, "Closed");
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
          label: "Draft",
          value: draftCount,
          summary: formatReceivingReportPercentage(draftCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Pending",
          value: pendingCount,
          summary: formatReceivingReportPercentage(pendingCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Approved",
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
