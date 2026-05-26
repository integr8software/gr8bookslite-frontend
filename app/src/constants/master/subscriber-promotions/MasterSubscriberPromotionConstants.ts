import type {
	MasterSubscriberPromotionAssignmentMode,
	MasterSubscriberPromotionStatus,
	MasterSubscriberPromotionTableColumnKey,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";

export const MasterSubscriberPromotionsHref =
	"/master/subscriber-promotions";

export const MasterSubscriberPromotionAddHref = `${MasterSubscriberPromotionsHref}/add`;

export const MasterSubscriberPromotionPaginationStorageKey =
	"master-subscriber-promotions";

export const MasterSubscriberPromotionStatusOptions = [
	"All statuses",
	"Available",
	"Used",
	"Expired",
	"Revoked",
] as const satisfies readonly (
	| "All statuses"
	| MasterSubscriberPromotionStatus
)[];

export const MasterSubscriberPromotionAssignmentModeOptions = [
	"Chosen subscriber",
	"Condition based",
	"Multiple selected",
	"Random pick",
] as const satisfies readonly MasterSubscriberPromotionAssignmentMode[];

export const MasterSubscriberPromotionAssignmentModeFilterOptions = [
	"All modes",
	...MasterSubscriberPromotionAssignmentModeOptions,
] as const satisfies readonly (
	| "All modes"
	| MasterSubscriberPromotionAssignmentMode
)[];

export const MasterSubscriberPromotionTableColumns = [
	{ key: "subscriberName", label: "Subscriber", className: "w-[20rem]" },
	{ key: "promotionName", label: "Promotion", className: "w-[18rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "assignmentMode", label: "Mode", className: "w-[13rem]" },
	{ key: "assignedAt", label: "Assigned", className: "w-[11rem]" },
	{ key: "usedAt", label: "Used", className: "w-[11rem]" },
	{ key: "expiresAt", label: "Expires", className: "w-[11rem]" },
] as const satisfies readonly {
	key: MasterSubscriberPromotionTableColumnKey;
	label: string;
	className: string;
}[];
