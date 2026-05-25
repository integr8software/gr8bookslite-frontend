import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionPlanStatus,
	MasterSubscriptionTableColumnKey,
	MasterSubscriptionUnit,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

export const MasterSubscriptionsHref = "/master/subscriptions";

export const MasterSubscriptionPaginationStorageKey =
	"master-subscription-maintenance";

export const MasterSubscriptionStatusOptions = [
	"Active",
	"Draft",
	"Inactive",
] as const satisfies readonly MasterSubscriptionPlanStatus[];

export const MasterSubscriptionBillingCycleOptions = [
	"Monthly",
	"Annual",
] as const satisfies readonly MasterSubscriptionBillingCycle[];

export const MasterSubscriptionUnitOptions = [
	"company",
	"branch",
	"user",
] as const satisfies readonly MasterSubscriptionUnit[];

export const MasterSubscriptionUnitLabels = {
	branch: "Branch / satellite",
	company: "Company",
	user: "User",
} as const satisfies Record<MasterSubscriptionUnit, string>;

export const MasterSubscriptionUnitShortLabels = {
	branch: "Branches",
	company: "Companies",
	user: "Users",
} as const satisfies Record<MasterSubscriptionUnit, string>;

export const MasterSubscriptionTableColumns = [
	{ key: "name", label: "Company", className: "w-[19rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "rating", label: "Rating", className: "w-[9rem]" },
	{ label: "Plan", className: "w-[13rem]" },
	{ key: "billingCycle", label: "Cycle", className: "w-[8rem]" },
	{ key: "durationMonths", label: "Duration", className: "w-[8rem]" },
	{ key: "companyCount", label: "Companies", className: "w-[8rem]" },
	{ key: "branchCount", label: "Branches", className: "w-[8rem]" },
	{ key: "userCount", label: "Users", className: "w-[7rem]" },
	{ label: "Monthly total", className: "w-[10rem]" },
	{ key: "renewalDate", label: "Renewal", className: "w-[10rem]" },
	{ label: "Actions", className: "w-[7rem] text-center" },
] as const satisfies readonly (
	| {
			key: MasterSubscriptionTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
