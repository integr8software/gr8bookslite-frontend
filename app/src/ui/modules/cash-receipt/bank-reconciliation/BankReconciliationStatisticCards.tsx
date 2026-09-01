"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  XCircle,
} from "lucide-react";
import type {
  BankReconciliationStatistics,
  BankReconciliationStatusFilter,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

type BankReconciliationStatisticCardsProps = {
  isLoading: boolean;
  onStatusFilterChange: (status: BankReconciliationStatusFilter) => void;
  statistics: BankReconciliationStatistics;
  statusFilter: BankReconciliationStatusFilter;
};

export function BankReconciliationStatisticCards({
  isLoading,
  onStatusFilterChange,
  statistics,
  statusFilter,
}: BankReconciliationStatisticCardsProps) {
  const totalCount = statistics.totalReconciliations;
  const cards = [
    {
      label: "Total Reconciliations",
      value: totalCount,
      summary: "All time",
      icon: FileText,
      iconClassName: "bg-skyblue/20 text-skyblue",
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: "Open / Draft",
      value: statistics.openCount,
      summary: formatPartOfTotalPercentage(statistics.openCount, totalCount),
      icon: Clock3,
      iconClassName: "bg-offwhite text-darknavy",
      isActive: statusFilter === "Open" || statusFilter === "Draft",
      onClick: () => onStatusFilterChange("Open"),
    },
    {
      label: "For Approval",
      value: statistics.forApprovalCount,
      summary: formatPartOfTotalPercentage(
        statistics.forApprovalCount,
        totalCount,
      ),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-emerald-700",
      isActive: statusFilter === "For Approval",
      onClick: () => onStatusFilterChange("For Approval"),
    },
    {
      label: "Posted",
      value: statistics.postedCount,
      summary: formatPartOfTotalPercentage(statistics.postedCount, totalCount),
      icon: PackageCheck,
      iconClassName: "bg-skyblue/20 text-darknavy",
      isActive: statusFilter === "Posted",
      onClick: () => onStatusFilterChange("Posted"),
    },
    {
      label: "Disapproved",
      value: statistics.disapprovedCount,
      summary: formatPartOfTotalPercentage(
        statistics.disapprovedCount,
        totalCount,
      ),
      icon: XCircle,
      iconClassName: "bg-coralpink/15 text-coralpink",
      isActive: statusFilter === "Disapproved",
      onClick: () => onStatusFilterChange("Disapproved"),
    },
    {
      label: "Cancelled",
      value: statistics.cancelledCount,
      summary: formatPartOfTotalPercentage(
        statistics.cancelledCount,
        totalCount,
      ),
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-700",
      isActive: statusFilter === "Cancelled",
      onClick: () => onStatusFilterChange("Cancelled"),
    },
  ];

  return (
    <ModuleStatisticCards
      items={cards}
      isLoading={isLoading}
      className="2xl:grid-cols-6"
    />
  );
}
