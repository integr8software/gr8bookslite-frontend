import {
	Building2,
	CircleCheck,
	CirclePause,
	CircleX,
	CreditCard,
	Database,
	GitBranch,
	ReceiptText,
	UserRoundCog,
	Users,
	type LucideIcon,
} from "lucide-react";
import type {
	MasterSubscriberManagementBranchStatus,
	MasterSubscriberManagementBranchType,
	MasterSubscriberManagementCompanySection,
	MasterSubscriberManagementStatus,
	MasterSubscriberManagementTableColumnKey,
	MasterSubscriberManagementUserStatus,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";

export const MasterSubscriberManagementHref =
	"/master/subscriber-management";
export const MasterSubscriberManagementAddHref =
	`${MasterSubscriberManagementHref}/add`;

export const MasterSubscriberManagementPaginationStorageKey =
	"master-subscriber-management-rich-list";

export const MasterSubscriberManagementStatusOptions = [
	"Active",
	"Suspended",
	"Inactive",
] as const satisfies readonly MasterSubscriberManagementStatus[];

export const MasterSubscriberManagementBranchStatusOptions = [
	"Active",
	"Trial",
	"Past Due",
	"Suspended",
	"Inactive",
	"Pending Setup",
] as const satisfies readonly MasterSubscriberManagementBranchStatus[];

export const MasterSubscriberManagementBranchTypeOptions = [
	"Head Office",
	"Branch",
	"Satellite",
] as const satisfies readonly MasterSubscriberManagementBranchType[];

export const MasterSubscriberManagementUserStatusOptions = [
	"Active",
	"Inactive",
	"Invited",
] as const satisfies readonly MasterSubscriberManagementUserStatus[];

export type MasterSubscriberManagementSubscriptionPlanOption = {
	description: string;
	id: string;
	monthlyAmount: string;
	name: string;
	yearlyAmount: string;
};

export type MasterSubscriberManagementSubscriptionBillingCycle =
	| "Monthly"
	| "Yearly";

export const MasterSubscriberManagementSubscriptionPlanOptions = [
	{
		description:
			"Core accounting access for ledgers, journals, receipts, disbursements, and financial reports.",
		id: "accounting-plan",
		monthlyAmount: "$399.00 / month",
		name: "Accounting",
		yearlyAmount: "$4,788.00 / year",
	},
	{
		description:
			"Inventory and purchasing access for items, warehouses, receiving, requests, and stock movement.",
		id: "inventory-plan",
		monthlyAmount: "$399.00 / month",
		name: "Inventory",
		yearlyAmount: "$4,788.00 / year",
	},
	{
		description:
			"Combined accounting and inventory coverage for companies that need full operational workflows.",
		id: "accounting-inventory-plan",
		monthlyAmount: "$499.00 / month",
		name: "Accounting + Inventory",
		yearlyAmount: "$5,988.00 / year",
	},
] as const satisfies readonly MasterSubscriberManagementSubscriptionPlanOption[];

export const MasterSubscriberManagementTableColumns = [
	{
		className: "w-[16rem]",
		key: "name",
		label: "Subscriber",
		sortable: true,
	},
	{
		className: "w-[16rem]",
		key: "email",
		label: "Contact Email",
		sortable: true,
	},
	{
		className: "w-[14rem]",
		key: "contactNumber",
		label: "Contact No.",
		sortable: true,
	},
	{
		className: "w-[8rem] text-center",
		key: "companies",
		label: "Companies",
		sortable: true,
	},
	{
		className: "w-[8rem] text-center",
		key: "branches",
		label: "Branches",
		sortable: true,
	},
	{
		className: "w-[7rem] text-center",
		key: "users",
		label: "Users",
		sortable: true,
	},
	{
		className: "w-[12rem]",
		key: "dateRegisteredLabel",
		label: "Date Registered",
		sortable: true,
	},
	{
		className: "w-[9rem]",
		key: "status",
		label: "Status",
		sortable: true,
	},
	{
		className: "w-[12rem]",
		key: "lastLoginDate",
		label: "Last Login",
		sortable: true,
	},
	{
		className: "w-[7rem] text-center",
		label: "Actions",
	},
] as const satisfies readonly (
	| {
			className: string;
			key: MasterSubscriberManagementTableColumnKey;
			label: string;
			sortable: boolean;
	  }
	| {
			className: string;
			label: string;
	  }
)[];

export const MasterSubscriberManagementCompanySections = [
	{
		icon: Building2,
		key: "company-information",
		label: "Company Details",
		pageTitle: "Company Information",
	},
	{
		icon: GitBranch,
		key: "branches",
		label: "Branches (5)",
		pageTitle: "Branches",
	},
	{
		icon: Users,
		key: "users",
		label: "Users (35)",
		pageTitle: "Users",
	},
	{
		icon: Database,
		key: "storage",
		label: "Storage",
		pageTitle: "Storage",
	},
	{
		icon: CreditCard,
		key: "subscription-and-plan",
		label: "Subscription & Plan",
		pageTitle: "Subscription & Plan",
	},
	{
		icon: ReceiptText,
		key: "billing-and-invoices",
		label: "Billing & Invoices",
		pageTitle: "Billing & Invoices",
	},
] as const satisfies readonly {
	icon: LucideIcon;
	key: MasterSubscriberManagementCompanySection;
	label: string;
	pageTitle: string;
}[];

export const MasterSubscriberAccountTabs = [
	{
		icon: UserRoundCog,
		key: "account-information",
		label: "Account Information",
	},
	{
		icon: Building2,
		key: "company-information",
		label: "Company Information",
	},
	{
		icon: Users,
		key: "users",
		label: "Users",
	},
] as const;

export const MasterSubscriberStatusIconByStatus = {
	Active: CircleCheck,
	Inactive: CircleX,
	Suspended: CirclePause,
} as const satisfies Record<MasterSubscriberManagementStatus, LucideIcon>;

export function getMasterSubscriberManagementViewHref(recordId: string) {
	return `${MasterSubscriberManagementHref}/view/${recordId}`;
}

export function getMasterSubscriberManagementEditHref(recordId: string) {
	return `${MasterSubscriberManagementHref}/edit/${recordId}`;
}

export function getMasterSubscriberManagementSectionHref(
	recordId: string,
	section: MasterSubscriberManagementCompanySection,
	companyId?: string,
) {
	const href = `${getMasterSubscriberManagementViewHref(recordId)}/${section}`;

	return companyId ? `${href}/${encodeURIComponent(companyId)}` : href;
}

export function getMasterSubscriberManagementCompanyInformationEditHref(
	recordId: string,
	companyId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"company-information",
		companyId,
	)}/edit`;
}

export function getMasterSubscriberManagementBranchAddHref(
	recordId: string,
	companyId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"branches",
		companyId,
	)}/add`;
}

export function getMasterSubscriberManagementBranchEditHref(
	recordId: string,
	companyId: string,
	branchId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"branches",
		companyId,
	)}/edit/${encodeURIComponent(branchId)}`;
}

export function getMasterSubscriberManagementUserAddHref(
	recordId: string,
	companyId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"users",
		companyId,
	)}/add`;
}

export function getMasterSubscriberManagementUserViewHref(
	recordId: string,
	companyId: string,
	userId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"users",
		companyId,
	)}/view/${encodeURIComponent(userId)}`;
}

export function getMasterSubscriberManagementUserEditHref(
	recordId: string,
	companyId: string,
	userId: string,
) {
	return `${getMasterSubscriberManagementSectionHref(
		recordId,
		"users",
		companyId,
	)}/edit/${encodeURIComponent(userId)}`;
}

export function getMasterSubscriberManagementSectionPageTitle(
	section: MasterSubscriberManagementCompanySection,
) {
	return (
		MasterSubscriberManagementCompanySections.find(
			(item) => item.key === section,
		)?.pageTitle ?? "Company Information"
	);
}
