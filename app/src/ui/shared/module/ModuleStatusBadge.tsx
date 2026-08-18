import { Ban, CheckCircle2, Clock, XCircle } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleStatusBadgeProps<TStatus extends string = string> = {
  className?: string;
  status: TStatus;
};

export function ModuleStatusBadge<TStatus extends string = string>({
  className,
  status,
}: ModuleStatusBadgeProps<TStatus>) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-4",
        getModuleStatusBadgeClassName(status),
        className,
      )}
    >
      {status}
    </span>
  );
}

export function getModuleStatusBadgeClassName(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
    case "approved":
    case "posted":
    case "paid":
    case "completed":
      return "module-status-badge-success border-emerald-300 bg-emerald-50 text-emerald-700";
    case "inactive":
    case "cancelled":
    case "void":
    case "closed":
      return "module-status-badge-neutral border-slate-200 bg-slate-50 text-slate-600";
    case "draft":
      return "module-status-badge-draft border-blue-200 bg-blue-50 text-blue-700";
    case "pending":
    case "for approval":
      return "module-status-badge-warning border-amber-200 bg-amber-50 text-amber-700";
    case "disapproved":
    case "rejected":
    case "overdue":
    case "failed":
      return "module-status-badge-danger border-red-200 bg-red-50 text-red-700";
    default:
      return "border-darknavy/10 bg-offwhite text-darknavy/70";
  }
}

export function getModuleStatusMetricIconClassName(status: string) {
  switch (status.trim().toLowerCase()) {
    case "draft":
      return "module-status-metric-icon-draft bg-blue-50 text-blue-700";
    case "pending":
    case "for approval":
      return "module-status-metric-icon-warning bg-amber-50 text-amber-700";
    case "active":
    case "approved":
    case "posted":
    case "paid":
    case "completed":
      return "module-status-metric-icon-success bg-emerald-50 text-emerald-700";
    case "disapproved":
    case "rejected":
    case "overdue":
    case "failed":
      return "module-status-metric-icon-danger bg-red-50 text-red-700";
    case "inactive":
    case "cancelled":
    case "void":
    case "closed":
      return "module-status-metric-icon-neutral bg-slate-100 text-slate-700";
    default:
      return "bg-offwhite text-darknavy/70";
  }
}

export function getModuleStatusMetricIcon(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
    case "approved":
    case "posted":
    case "paid":
    case "completed":
      return CheckCircle2;
    case "inactive":
    case "cancelled":
    case "void":
    case "closed":
      return Ban;
    case "disapproved":
    case "rejected":
    case "overdue":
    case "failed":
      return XCircle;
    default:
      return Clock;
  }
}
