import { ReceiptText } from "lucide-react";
import {
  CashVoucherAllStatusFilter,
  CashVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { getCashVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatusFilter,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

export function CashVoucherMetrics({
  onStatusFilterChange,
  previewRows,
  statusFilter,
}: {
  onStatusFilterChange: (status: CashVoucherStatusFilter) => void;
  previewRows: CashVoucherPreviewRow[];
  statusFilter: CashVoucherStatusFilter;
}) {
  const draftCount = countPreviewRowsByStatus(previewRows, CashVoucherStatuses.draft);
  const forApprovalCount = countPreviewRowsByStatus(previewRows, CashVoucherStatuses.forApproval);
  const postedCount = countPreviewRowsByStatus(previewRows, CashVoucherStatuses.posted);
  const disapprovedCount = countPreviewRowsByStatus(previewRows, CashVoucherStatuses.disapproved);
  const cancelledCount = countPreviewRowsByStatus(previewRows, CashVoucherStatuses.cancelled);
  const cards = [
    {
      label: "Total Entries",
      value: previewRows.length,
      summary: "All time",
      icon: ReceiptText,
      tone: "violet" as const,
      isActive: statusFilter === CashVoucherAllStatusFilter,
      onClick: () => onStatusFilterChange(CashVoucherAllStatusFilter),
    },
    {
      label: CashVoucherStatuses.draft,
      value: draftCount,
      summary: formatPartOfTotalPercentage(draftCount, previewRows.length),
      icon: getModuleStatusMetricIcon(CashVoucherStatuses.draft),
      iconClassName: getModuleStatusMetricIconClassName(CashVoucherStatuses.draft),
      tone: "blue" as const,
      isActive: statusFilter === CashVoucherStatuses.draft,
      onClick: () => onStatusFilterChange(CashVoucherStatuses.draft),
    },
    {
      label: CashVoucherStatuses.forApproval,
      value: forApprovalCount,
      summary: formatPartOfTotalPercentage(forApprovalCount, previewRows.length),
      icon: getModuleStatusMetricIcon(CashVoucherStatuses.forApproval),
      iconClassName: getModuleStatusMetricIconClassName(CashVoucherStatuses.forApproval),
      tone: "amber" as const,
      isActive: statusFilter === CashVoucherStatuses.forApproval,
      onClick: () => onStatusFilterChange(CashVoucherStatuses.forApproval),
    },
    {
      label: CashVoucherStatuses.posted,
      value: postedCount,
      summary: formatPartOfTotalPercentage(postedCount, previewRows.length),
      icon: getModuleStatusMetricIcon(CashVoucherStatuses.posted),
      iconClassName: getModuleStatusMetricIconClassName(CashVoucherStatuses.posted),
      tone: "emerald" as const,
      isActive: statusFilter === CashVoucherStatuses.posted,
      onClick: () => onStatusFilterChange(CashVoucherStatuses.posted),
    },
    {
      label: CashVoucherStatuses.disapproved,
      value: disapprovedCount,
      summary: formatPartOfTotalPercentage(disapprovedCount, previewRows.length),
      icon: getModuleStatusMetricIcon(CashVoucherStatuses.disapproved),
      iconClassName: getModuleStatusMetricIconClassName(CashVoucherStatuses.disapproved),
      tone: "red" as const,
      isActive: statusFilter === CashVoucherStatuses.disapproved,
      onClick: () => onStatusFilterChange(CashVoucherStatuses.disapproved),
    },
    {
      label: CashVoucherStatuses.cancelled,
      value: cancelledCount,
      summary: formatPartOfTotalPercentage(cancelledCount, previewRows.length),
      icon: getModuleStatusMetricIcon(CashVoucherStatuses.cancelled),
      iconClassName: getModuleStatusMetricIconClassName(CashVoucherStatuses.cancelled),
      tone: "slate" as const,
      isActive: statusFilter === CashVoucherStatuses.cancelled,
      onClick: () => onStatusFilterChange(CashVoucherStatuses.cancelled),
    },
  ];

  return <ModuleStatisticCards items={cards} className="2xl:grid-cols-6" />;
}

function countPreviewRowsByStatus(
  previewRows: CashVoucherPreviewRow[],
  status: ReturnType<typeof getCashVoucherDisplayStatus>,
) {
  return previewRows.filter((row) => getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status).length;
}


