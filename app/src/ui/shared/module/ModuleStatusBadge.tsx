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
				"inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
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
			return "bg-citron/25 text-darknavy";
		case "inactive":
		case "cancelled":
		case "void":
		case "closed":
			return "bg-darknavy/8 text-darknavy/55";
		case "pending":
		case "draft":
		case "for approval":
			return "bg-amber-50 text-amber-700";
		case "rejected":
		case "overdue":
		case "failed":
			return "bg-coralpink/10 text-coralpink";
		default:
			return "bg-offwhite text-darknavy/70";
	}
}
