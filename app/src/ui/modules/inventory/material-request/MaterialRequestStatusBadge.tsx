import { Ban, CheckCircle2, Clock3, PackageCheck, XCircle } from "lucide-react";
import type { MaterialRequestStatus } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestStatusBadgeProps = {
	status: MaterialRequestStatus;
};

export function MaterialRequestStatusBadge({
	status,
}: MaterialRequestStatusBadgeProps) {
	const Icon = statusIconByStatus[status];

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status],
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

const statusIconByStatus = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Completed: PackageCheck,
	Draft: Clock3,
	Pending: Clock3,
	Rejected: XCircle,
} satisfies Record<MaterialRequestStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Completed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
	Rejected: "bg-coralpink/15 text-coralpink",
} satisfies Record<MaterialRequestStatus, string>;
