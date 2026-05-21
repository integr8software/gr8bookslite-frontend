import type {
	ResponsibilityCenterStatus,
	ResponsibilityCenterType,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

export const ResponsibilityCenterHref =
	"/maintenance/financial-management/responsibility-center";

export const ResponsibilityCenterTypeOptions: ResponsibilityCenterType[] = [
	"Cost Center",
	"Profit Center",
	"Revenue Center",
	"Investment Center",
];

export const ResponsibilityCenterStatusOptions: ResponsibilityCenterStatus[] = [
	"Active",
	"Inactive",
];

export const ResponsibilityCenterActionCopy = {
	add: {
		title: "Add Responsibility Center",
		description:
			"Create a center used to assign accountability across financial reports and transactions.",
	},
	edit: {
		title: "Edit Responsibility Center",
		description:
			"Update center ownership, hierarchy, and reporting status.",
	},
	view: {
		title: "View Responsibility Center",
		description:
			"Review the center details used for financial accountability.",
	},
} as const;
