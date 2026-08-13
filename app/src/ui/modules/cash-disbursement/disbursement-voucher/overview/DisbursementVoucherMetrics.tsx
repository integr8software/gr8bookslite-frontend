import { ReceiptText } from "lucide-react";
import {
  DisbursementVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { getDisbursementVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherStatusFilter,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

export function DisbursementVoucherMetrics({
  onStatusFilterChange,
  previewRows,
  statusFilter,
}: {
  onStatusFilterChange: (status: DisbursementVoucherStatusFilter) => void;
  previewRows: DisbursementVoucherPreviewRow[];
  statusFilter: DisbursementVoucherStatusFilter;
}) {
  const draftCount = countPreviewRowsByStatus(previewRows, DisbursementVoucherStatuses.draft);
  const forApprovalCount = countPreviewRowsByStatus(previewRows, DisbursementVoucherStatuses.forApproval);
  const postedCount = countPreviewRowsByStatus(previewRows, DisbursementVoucherStatuses.posted);
  const disapprovedCount = countPreviewRowsByStatus(previewRows, DisbursementVoucherStatuses.disapproved);
  const cancelledCount = countPreviewRowsByStatus(previewRows, DisbursementVoucherStatuses.cancelled);
  const cards = [
    {
      label: "Total Entries",
      value: previewRows.length,
      summary: "All time",
      icon: ReceiptText,
      tone: "violet" as const,
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: DisbursementVoucherStatuses.draft,
      value: draftCount,
      summary: formatPartOfTotalPercentage(draftCount, previewRows.length),
      icon: getModuleStatusMetricIcon(DisbursementVoucherStatuses.draft),
      iconClassName: getModuleStatusMetricIconClassName(DisbursementVoucherStatuses.draft),
      tone: "blue" as const,
      isActive: statusFilter === DisbursementVoucherStatuses.draft,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.draft),
    },
    {
      label: "For Approval",
      value: forApprovalCount,
      summary: formatPartOfTotalPercentage(forApprovalCount, previewRows.length),
      icon: getModuleStatusMetricIcon(DisbursementVoucherStatuses.forApproval),
      iconClassName: getModuleStatusMetricIconClassName(DisbursementVoucherStatuses.forApproval),
      tone: "amber" as const,
      isActive: statusFilter === DisbursementVoucherStatuses.forApproval,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.forApproval),
    },
    {
      label: "Posted",
      value: postedCount,
      summary: formatPartOfTotalPercentage(postedCount, previewRows.length),
      icon: getModuleStatusMetricIcon(DisbursementVoucherStatuses.posted),
      iconClassName: getModuleStatusMetricIconClassName(DisbursementVoucherStatuses.posted),
      tone: "emerald" as const,
      isActive: statusFilter === DisbursementVoucherStatuses.posted,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.posted),
    },
    {
      label: "Disapproved",
      value: disapprovedCount,
      summary: formatPartOfTotalPercentage(disapprovedCount, previewRows.length),
      icon: getModuleStatusMetricIcon(DisbursementVoucherStatuses.disapproved),
      iconClassName: getModuleStatusMetricIconClassName(DisbursementVoucherStatuses.disapproved),
      tone: "red" as const,
      isActive: statusFilter === DisbursementVoucherStatuses.disapproved,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.disapproved),
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      summary: formatPartOfTotalPercentage(cancelledCount, previewRows.length),
      icon: getModuleStatusMetricIcon(DisbursementVoucherStatuses.cancelled),
      iconClassName: getModuleStatusMetricIconClassName(DisbursementVoucherStatuses.cancelled),
      tone: "slate" as const,
      isActive: statusFilter === DisbursementVoucherStatuses.cancelled,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.cancelled),
    },
  ];

  return <ModuleStatisticCards items={cards} className="2xl:grid-cols-6" />;
}

function countPreviewRowsByStatus(
  previewRows: DisbursementVoucherPreviewRow[],
  status: ReturnType<typeof getDisbursementVoucherDisplayStatus>,
) {
  return previewRows.filter((row) => getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status).length;
}
