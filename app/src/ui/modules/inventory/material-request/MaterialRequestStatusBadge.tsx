import { CheckCircle2, Clock3, PackageCheck, XCircle } from "lucide-react";
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
	Approved: CheckCircle2,
	Completed: PackageCheck,
	Pending: Clock3,
	Rejected: XCircle,
} satisfies Record<MaterialRequestStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Approved: "bg-citron/25 text-darknavy",
	Completed: "bg-skyblue/20 text-darknavy",
	Pending: "bg-offwhite text-darknavy",
	Rejected: "bg-coralpink/15 text-coralpink",
} satisfies Record<MaterialRequestStatus, string>;
