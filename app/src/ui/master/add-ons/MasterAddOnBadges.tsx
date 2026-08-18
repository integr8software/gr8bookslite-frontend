import type { MasterAddOnStatus } from "@/app/src/types/master/add-ons/MasterAddOnTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterAddOnStatusBadge({
	status,
}: {
	status: MasterAddOnStatus;
}) {
	const classes = {
		Active: "bg-citron/30 text-darknavy ring-citron/45",
		Inactive: "bg-coralpink/12 text-coralpink ring-coralpink/20",
	} satisfies Record<MasterAddOnStatus, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}
