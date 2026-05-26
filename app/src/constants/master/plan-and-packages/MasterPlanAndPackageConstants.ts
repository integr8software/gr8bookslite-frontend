import type { MainNavigationItem } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { SidebarModuleNavigationSections } from "@/app/src/data/shared/main-layout/sidebar/SidebarModuleRegistry";
import type {
	MasterPlanAndPackageFeatureOption,
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
	"ONBOARDING",
	"ADDITIONAL_COMPANY",
] as const satisfies readonly MasterPlanAndPackageScope[];

export const MasterPlanAndPackageScopeLabels = {
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

export const MasterPlanAndPackageFeatureOptions =
	SidebarModuleNavigationSections.flatMap((section) =>
		flattenFeatureOptions(section.items, section.title, [section.title]),
	);

export const MasterPlanAndPackageTableColumns = [
	{ key: "name", label: "Plan", className: "w-[24rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "pricing", label: "Pricing", className: "w-[18rem]" },
	{ key: "scalePricing", label: "Scale Pricing", className: "w-[22rem]" },
	{ label: "Actions", className: "w-[17rem] text-right" },
] as const satisfies readonly (
	| {
			key: MasterPlanAndPackageTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

function flattenFeatureOptions(
	items: MainNavigationItem[],
	section: string,
	trail: string[],
): MasterPlanAndPackageFeatureOption[] {
	return items.flatMap((item) => {
		const currentTrail = [...trail, item.label];

		if (item.children?.length) {
			return flattenFeatureOptions(item.children, section, currentTrail);
		}

		return [
			{
				description: currentTrail.join(" / "),
				id: item.key,
				name: item.label,
				section,
			},
		];
	});
}
