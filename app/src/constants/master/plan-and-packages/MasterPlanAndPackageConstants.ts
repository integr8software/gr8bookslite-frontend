import type {
	MasterPlanAndPackagePricingKind,
	MasterPlanAndPackageStatus,
	MasterPlanAndPackageTableColumnKey,
	MasterPlanAndPackageUserLimitKind,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

export const MasterPlanAndPackagesHref = "/master/plan-and-packages";

export function getMasterPlanAndPackageViewHref(recordId: string) {
	return `${MasterPlanAndPackagesHref}/view/${recordId}`;
}

export function getMasterPlanAndPackageEditHref(recordId: string) {
	return `${MasterPlanAndPackagesHref}/edit/${recordId}`;
}

export const MasterPlanAndPackageAddHref = `${MasterPlanAndPackagesHref}/add`;

export const MasterPlanAndPackagePaginationStorageKey =
	"master-plan-and-packages";

export const MasterPlanAndPackageStatusOptions = [
	"Active",
	"Draft",
	"Inactive",
] as const satisfies readonly MasterPlanAndPackageStatus[];

export const MasterPlanAndPackagePricingKindOptions = [
	"Monthly",
	"Interval",
	"Yearly",
	"Transactional",
	"Percent Off",
] as const satisfies readonly MasterPlanAndPackagePricingKind[];

export const MasterPlanAndPackageUserLimitKindOptions = [
	"Fixed",
	"Range",
	"Add-on",
] as const satisfies readonly MasterPlanAndPackageUserLimitKind[];

export const MasterPlanAndPackageTableColumns = [
	{ key: "name", label: "Plan", className: "w-[24rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "pricing", label: "Pricing", className: "w-[16rem]" },
	{ key: "users", label: "Users", className: "w-[15rem]" },
	{ label: "Actions", className: "w-[17rem] text-right" },
] as const satisfies readonly (
	| {
			key: MasterPlanAndPackageTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
