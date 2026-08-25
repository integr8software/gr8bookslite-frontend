import type {
	MasterPlanAndPackageScope,
	MasterPlanAndPackageScalePeriod,
	MasterPlanAndPackageScaleUnit,
	MasterPlanAndPackageStatus,
	MasterPlanAndPackageTableColumnKey,
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

export const MasterPlanAndPackageScopeOptions = [
	"ALL",
	"ONBOARDING",
	"ADDITIONAL_COMPANY",
] as const satisfies readonly MasterPlanAndPackageScope[];

export type MasterPlanAndPackageStatusFilterValue =
	| "ALL"
	| MasterPlanAndPackageStatus;

export type MasterPlanAndPackageScopeFilterValue =
	| "ALL"
	| MasterPlanAndPackageScope;

export const MasterPlanAndPackageStatusFilterOptions = [
	{ label: "All", value: "ALL" },
	...MasterPlanAndPackageStatusOptions.map((status) => ({
		label: status,
		value: status,
	})),
] as const satisfies readonly {
	label: string;
	value: MasterPlanAndPackageStatusFilterValue;
}[];

export const MasterPlanAndPackageScopeFilterOptions = [
	{ label: "All", value: "ALL" },
	{ label: "New user onboarding", value: "ONBOARDING" },
	{ label: "Additional company", value: "ADDITIONAL_COMPANY" },
] as const satisfies readonly {
	label: string;
	value: MasterPlanAndPackageScopeFilterValue;
}[];

export const MasterPlanAndPackageScopeLabels = {
	ALL: "All",
	ONBOARDING: "New user onboarding",
	ADDITIONAL_COMPANY: "Additional company",
} as const satisfies Record<MasterPlanAndPackageScope, string>;

export const MasterPlanAndPackageScaleUnits = [
	"branch",
	"user",
] as const satisfies readonly MasterPlanAndPackageScaleUnit[];

export const MasterPlanAndPackageScalePeriods = [
	"monthly",
	"yearly",
] as const satisfies readonly MasterPlanAndPackageScalePeriod[];

export const MasterPlanAndPackageScalePeriodLabels = {
	monthly: "Monthly",
	yearly: "Yearly",
} as const satisfies Record<MasterPlanAndPackageScalePeriod, string>;

export const MasterPlanAndPackageScaleUnitLabels = {
	branch: "Branch",
	user: "User",
} as const satisfies Record<MasterPlanAndPackageScaleUnit, string>;

export const MasterPlanAndPackageTableColumns = [
	{ key: "name", label: "Plan", className: "w-[28rem]" },
	{ key: "status", label: "Status", className: "w-[10rem]" },
	{ key: "pricing", label: "Pricing", className: "w-[24rem]" },
	{ label: "Actions", className: "w-[6rem] text-center" },
] as const satisfies readonly (
	| {
			key: MasterPlanAndPackageTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
