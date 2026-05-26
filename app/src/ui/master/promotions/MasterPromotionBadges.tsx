import type { MasterPromotionStatus } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterPromotionStatusBadge({
	status,
}: {
	status: MasterPromotionStatus;
}) {
	const classes = {
		Active: "bg-citron/30 text-darknavy ring-citron/45",
		Draft: "bg-skyblue/12 text-darknavy ring-skyblue/22",
		Inactive: "bg-coralpink/12 text-coralpink ring-coralpink/20",
	} satisfies Record<MasterPromotionStatus, string>;

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
