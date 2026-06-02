import {
	Building2,
	CircleCheck,
	CirclePause,
	CircleX,
	CreditCard,
	Database,
	GitBranch,
	Users,
	type LucideIcon,
} from "lucide-react";
import type {
	MasterSubscriberManagementCompanySection,
	MasterSubscriberManagementStatus,
	MasterSubscriberManagementTableColumnKey,
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
		icon: CreditCard,
		key: "subscription-and-plan",
		label: "Subscription & Plan",
		pageTitle: "Subscription & Plan",
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
		icon: Building2,
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
		icon: Users,
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
) {
	return `${getMasterSubscriberManagementViewHref(recordId)}/${section}`;
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
