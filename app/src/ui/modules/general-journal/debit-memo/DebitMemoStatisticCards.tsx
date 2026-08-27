"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  XCircle,
} from "lucide-react";
import type {
  DebitMemoStatistics,
  DebitMemoStatusFilter,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

type DebitMemoStatisticCardsProps = {
  isLoading: boolean;
  onStatusFilterChange: (status: DebitMemoStatusFilter) => void;
  statistics: DebitMemoStatistics;
  statusFilter: DebitMemoStatusFilter;
};

export function DebitMemoStatisticCards({
  isLoading,
  onStatusFilterChange,
  statistics,
  statusFilter,
}: DebitMemoStatisticCardsProps) {
  const totalCount = statistics.totalVouchers;
  const cards = [
    {
      label: "Total Transaction",
      value: totalCount,
      summary: "All time",
      icon: FileText,
      iconClassName: "bg-skyblue/20 text-skyblue",
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: "Draft",
      value: statistics.draftVouchers,
      summary: formatPartOfTotalPercentage(statistics.draftVouchers, totalCount),
      icon: Clock3,
      iconClassName: "bg-offwhite text-darknavy",
      isActive: statusFilter === "Draft",
      onClick: () => onStatusFilterChange("Draft"),
    },
    {
      label: "For Approval",
      value: statistics.forApprovalVouchers,
      summary: formatPartOfTotalPercentage(statistics.forApprovalVouchers, totalCount),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-emerald-700",
      isActive: statusFilter === "For Approval",
      onClick: () => onStatusFilterChange("For Approval"),
    },
    {
      label: "Posted",
      value: statistics.postedVouchers,
      summary: formatPartOfTotalPercentage(statistics.postedVouchers, totalCount),
      icon: PackageCheck,
      iconClassName: "bg-skyblue/20 text-darknavy",
      isActive: statusFilter === "Posted",
      onClick: () => onStatusFilterChange("Posted"),
    },
    {
      label: "Disapproved",
      value: statistics.disapprovedVouchers,
      summary: formatPartOfTotalPercentage(statistics.disapprovedVouchers, totalCount),
      icon: XCircle,
      iconClassName: "bg-coralpink/15 text-coralpink",
      isActive: statusFilter === "Disapproved",
      onClick: () => onStatusFilterChange("Disapproved"),
    },
    {
      label: "Cancelled",
      value: statistics.cancelledVouchers,
      summary: formatPartOfTotalPercentage(statistics.cancelledVouchers, totalCount),
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-700",
      isActive: statusFilter === "Cancelled",
      onClick: () => onStatusFilterChange("Cancelled"),
    },
  ];

  return <ModuleStatisticCards items={cards} isLoading={isLoading} className="2xl:grid-cols-6" />;
}
