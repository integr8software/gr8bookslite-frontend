import { Ban, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import type { SalesInvoiceStatus } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function SalesInvoiceStatusBadge({
	status,
}: {
	status: SalesInvoiceStatus;
}) {
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
	Closed: PackageCheck,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<SalesInvoiceStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<SalesInvoiceStatus, string>;
