import type {
	MasterTenantAccessBillingStatus,
	MasterTenantAccessBranchType,
	MasterTenantAccessEntity,
	MasterTenantAccessStatus,
	MasterTenantAccessUserRole,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";

export const MasterSubscriberManagementHref = "/master/subscriber-management";
export const MasterCompanyManagementHref = "/master/company-management";
export const MasterBranchManagementHref = "/master/branch-management";
export const MasterUsersManagementHref = "/master/users-management";

export const MasterTenantAccessHrefByEntity = {
	branch: MasterBranchManagementHref,
	company: MasterCompanyManagementHref,
	subscriber: MasterSubscriberManagementHref,
	user: MasterUsersManagementHref,
} as const satisfies Record<MasterTenantAccessEntity, string>;

export const MasterTenantAccessEntityLabels = {
	branch: {
		addTitle: "Add Branch",
		description:
			"Maintain company branches and satellites from the Master tenant directory.",
		emptyDescription:
			"Add a branch after its company exists in the Master company list.",
		emptyTitle: "No branches found",
		header: "Branch Management",
		listEyebrow: "Company operating units",
		recordLabel: "branch",
		saveLabel: "Save Branch",
	},
	company: {
		addTitle: "Add Company",
		description:
			"Maintain every company owned by a subscriber, including the initial company created during subscription setup.",
		emptyDescription:
			"Add a company under an existing subscriber to expand the tenant.",
		emptyTitle: "No companies found",
		header: "Company Management",
		listEyebrow: "Subscriber companies",
		recordLabel: "company",
		saveLabel: "Save Company",
	},
	subscriber: {
		addTitle: "Add Subscriber",
		description:
			"Maintain subscriber accounts, owner contacts, billing state, and the required initial company.",
		emptyDescription:
			"Add a subscriber to create the first tenant owner and initial company.",
		emptyTitle: "No subscribers found",
		header: "Subscriber Management",
		listEyebrow: "Tenant ownership",
		recordLabel: "subscriber",
		saveLabel: "Save Subscriber",
	},
	user: {
		addTitle: "Add User",
		description:
			"Maintain subscriber users and assign each user to one or more companies and branches.",
		emptyDescription:
			"Add a user after the subscriber has at least one company.",
		emptyTitle: "No users found",
		header: "User Management",
		listEyebrow: "Cross-company access",
		recordLabel: "user",
		saveLabel: "Save User",
	},
} as const satisfies Record<
	MasterTenantAccessEntity,
	{
		addTitle: string;
		description: string;
		emptyDescription: string;
		emptyTitle: string;
		header: string;
		listEyebrow: string;
		recordLabel: string;
		saveLabel: string;
	}
>;

export const MasterTenantAccessStatusOptions = [
	"Active",
	"Trial",
	"Past Due",
	"Suspended",
	"Inactive",
	"Pending Setup",
] as const satisfies readonly MasterTenantAccessStatus[];

export const MasterTenantAccessBillingStatusOptions = [
	"Current",
	"Trial",
	"Payment Due",
	"Paused",
	"Setup",
] as const satisfies readonly MasterTenantAccessBillingStatus[];

export const MasterTenantAccessBranchTypeOptions = [
	"Head Office",
	"Branch",
	"Satellite",
] as const satisfies readonly MasterTenantAccessBranchType[];

export const MasterTenantAccessUserRoleOptions = [
	"Owner",
	"Company Admin",
	"Branch Manager",
	"Accountant",
	"Viewer",
] as const satisfies readonly MasterTenantAccessUserRole[];

export const MasterTenantAccessPlanOptions = [
	"Accounting",
	"Inventory",
	"Accounting + Inventory",
	"Full Suite Annual",
] as const;

export const MasterTenantAccessTableColumns = {
	branch: [
		{ key: "primaryText", label: "Branch", className: "w-[20rem]" },
		{ key: "relationName", label: "Company", className: "w-[18rem]" },
		{ key: "relationText", label: "Subscriber", className: "w-[18rem]" },
		{ key: "status", label: "Status", className: "w-[10rem]" },
		{ key: "detailText", label: "Type / TIN", className: "w-[14rem]" },
		{ label: "Actions", className: "w-[7rem] text-center" },
	],
	company: [
		{ key: "primaryText", label: "Company", className: "w-[22rem]" },
		{ key: "relationName", label: "Subscriber", className: "w-[18rem]" },
		{ key: "status", label: "Status", className: "w-[10rem]" },
		{ key: "countA", label: "Branches", className: "w-[8rem]" },
		{ key: "countB", label: "Users", className: "w-[7rem]" },
		{ key: "detailText", label: "Plan", className: "w-[15rem]" },
		{ label: "Actions", className: "w-[7rem] text-center" },
	],
	subscriber: [
		{ key: "primaryText", label: "Subscriber", className: "w-[22rem]" },
		{ key: "relationName", label: "Initial Company", className: "w-[20rem]" },
		{ key: "status", label: "Status", className: "w-[10rem]" },
		{ key: "countA", label: "Companies", className: "w-[8rem]" },
		{ key: "countB", label: "Users", className: "w-[7rem]" },
		{ key: "detailText", label: "Billing", className: "w-[14rem]" },
		{ key: "dateText", label: "Renewal", className: "w-[11rem]" },
		{ label: "Actions", className: "w-[7rem] text-center" },
	],
	user: [
		{ key: "primaryText", label: "User", className: "w-[22rem]" },
		{ key: "relationName", label: "Subscriber", className: "w-[18rem]" },
		{ key: "status", label: "Status", className: "w-[10rem]" },
		{ key: "countA", label: "Companies", className: "w-[8rem]" },
		{ key: "countB", label: "Branches", className: "w-[8rem]" },
		{ key: "detailText", label: "Primary Role", className: "w-[14rem]" },
		{ key: "dateText", label: "Last Login", className: "w-[11rem]" },
		{ label: "Actions", className: "w-[7rem] text-center" },
	],
} as const;

export const MasterTenantAccessPaginationStorageKey = {
	branch: "master-branch-management",
	company: "master-company-management",
	subscriber: "master-subscriber-management",
	user: "master-users-management",
} as const satisfies Record<MasterTenantAccessEntity, string>;

export function getMasterTenantAccessHref(entity: MasterTenantAccessEntity) {
	return MasterTenantAccessHrefByEntity[entity];
}

export function getMasterTenantAccessAddHref(entity: MasterTenantAccessEntity) {
	return `${getMasterTenantAccessHref(entity)}/add`;
}

export function getMasterTenantAccessViewHref(
	entity: MasterTenantAccessEntity,
	recordId: string,
) {
	return `${getMasterTenantAccessHref(entity)}/view/${recordId}`;
}

export function getMasterTenantAccessEditHref(
	entity: MasterTenantAccessEntity,
	recordId: string,
) {
	return `${getMasterTenantAccessHref(entity)}/edit/${recordId}`;
}
