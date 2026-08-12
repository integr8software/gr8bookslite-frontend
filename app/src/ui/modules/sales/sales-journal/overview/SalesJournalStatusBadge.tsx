import { Ban, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import type { SalesJournalStatus } from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type SalesJournalStatusBadgeProps = {
	status: SalesJournalStatus;
};

export function SalesJournalStatusBadge({ status }: SalesJournalStatusBadgeProps) {
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
	Cancelled: Ban,
	Closed: PackageCheck,
	Draft: Clock3,
	Open: CheckCircle2,
} satisfies Record<SalesJournalStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Open: "bg-citron/25 text-darknavy",
} satisfies Record<SalesJournalStatus, string>;
