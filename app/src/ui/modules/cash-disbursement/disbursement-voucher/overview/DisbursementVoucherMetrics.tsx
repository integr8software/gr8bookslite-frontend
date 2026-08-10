import { CheckCircle2, Clock3, ReceiptText, XCircle } from "lucide-react";
import {
  DisbursementVoucherStatuses,
  type DisbursementVoucherStatusFilters,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { getDisbursementVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

type DisbursementVoucherStatusFilter = (typeof DisbursementVoucherStatusFilters)[number];

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
      label: "Total Vouchers",
      value: previewRows.length,
      summary: "All time",
      icon: ReceiptText,
      iconClassName: "bg-skyblue/20 text-skyblue",
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: "Draft",
      value: draftCount,
      summary: formatPartOfTotalPercentage(draftCount, previewRows.length),
      icon: Clock3,
      iconClassName: "bg-offwhite text-darknavy",
      isActive: statusFilter === DisbursementVoucherStatuses.draft,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.draft),
    },
    {
      label: "For Approval",
      value: forApprovalCount,
      summary: formatPartOfTotalPercentage(forApprovalCount, previewRows.length),
      icon: Clock3,
      iconClassName: "bg-citron/25 text-darknavy",
      isActive: statusFilter === DisbursementVoucherStatuses.forApproval,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.forApproval),
    },
    {
      label: "Posted",
      value: postedCount,
      summary: formatPartOfTotalPercentage(postedCount, previewRows.length),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-emerald-700",
      isActive: statusFilter === DisbursementVoucherStatuses.posted,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.posted),
    },
    {
      label: "Disapproved",
      value: disapprovedCount,
      summary: formatPartOfTotalPercentage(disapprovedCount, previewRows.length),
      icon: XCircle,
      iconClassName: "bg-coralpink/15 text-coralpink",
      isActive: statusFilter === DisbursementVoucherStatuses.disapproved,
      onClick: () => onStatusFilterChange(DisbursementVoucherStatuses.disapproved),
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      summary: formatPartOfTotalPercentage(cancelledCount, previewRows.length),
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-700",
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
