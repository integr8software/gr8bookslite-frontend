import type {
	MasterSubscriberPromotionAssignmentMode,
	MasterSubscriberPromotionStatus,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const StatusTone: Record<MasterSubscriberPromotionStatus, string> = {
	Available: "bg-skyblue/12 text-darknavy ring-skyblue/25",
	Expired: "bg-offwhite text-darknavy/65 ring-darknavy/10",
	Revoked: "bg-coralpink/12 text-coralpink ring-coralpink/18",
	Used: "bg-citron/35 text-darknavy ring-citron/50",
};

const ModeTone: Record<MasterSubscriberPromotionAssignmentMode, string> = {
	"Chosen subscriber": "bg-skyblue/12 text-darknavy ring-skyblue/25",
	"Condition based": "bg-offwhite text-darknavy ring-darknavy/10",
	"Multiple selected": "bg-citron/35 text-darknavy ring-citron/50",
	"Random pick": "bg-coralpink/12 text-coralpink ring-coralpink/18",
};

export function MasterSubscriberPromotionStatusBadge({
	status,
}: {
	status: MasterSubscriberPromotionStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1",
				StatusTone[status],
			)}
		>
			{status}
		</span>
	);
}

export function MasterSubscriberPromotionModeBadge({
	mode,
}: {
	mode: MasterSubscriberPromotionAssignmentMode;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1",
				ModeTone[mode],
			)}
		>
			{mode}
		</span>
	);
}
