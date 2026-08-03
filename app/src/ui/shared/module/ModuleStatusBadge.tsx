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
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "inactive":
    case "cancelled":
    case "void":
    case "closed":
      return "border-slate-200 bg-slate-50 text-slate-600";
    case "pending":
    case "draft":
    case "for approval":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "rejected":
    case "overdue":
    case "failed":
      return "border-coralpink/25 bg-coralpink/10 text-coralpink";
    default:
      return "border-darknavy/10 bg-offwhite text-darknavy/70";
  }
}
