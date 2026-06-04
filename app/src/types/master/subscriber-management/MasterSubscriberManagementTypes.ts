import type { LucideIcon } from "lucide-react";

export type MasterSubscriberManagementStatus =
	| "Active"
	| "Suspended"
	| "Inactive";

export type MasterSubscriberManagementCompanyStatus = "Active" | "Inactive";

export type MasterSubscriberManagementTaxpayerType =
	| "individual"
	| "non-individual";

export type MasterSubscriberManagementUserStatus =
	| "Active"
	| "Inactive"
	| "Invited";

export type MasterSubscriberManagementBranchStatus =
	| "Active"
	| "Trial"
	| "Past Due"
	| "Suspended"
	| "Inactive"
	| "Pending Setup";

export type MasterSubscriberManagementBranchType =
	| "Head Office"
	| "Branch"
	| "Satellite";

export type MasterSubscriberManagementCompanySection =
	| "company-information"
	| "subscription-and-plan"
	| "branches"
	| "users"
	| "storage"
	| "billing-and-invoices";

export type MasterSubscriberManagementListRecord = {
	branches: number;
	companies: number;
	contactNumber: string;
	dateRegistered: string;
	dateRegisteredLabel: string;
	email: string;
	iconTone: "blue" | "cyan" | "orange" | "purple" | "rose" | "slate";
	id: string;
	initials: string;
	lastLoginDate: string;
	lastLoginTime: string;
	name: string;
	registeredAt: string;
	status: MasterSubscriberManagementStatus;
	subscriberId: string;
	updatedAt: string;
	updatedBy: string;
	users: number;
};

export type MasterSubscriberManagementSummaryMetric = {
	helper: string;
	icon: LucideIcon;
	label: string;
	tone: "blue" | "emerald" | "amber" | "rose";
	value: number;
};

export type MasterSubscriberManagementCompanyRecord = {
	addressLines: string[];
	amount: string;
	billingCycle: string;
	branchCount: number;
	code: string;
	contactEmail: string;
	contactNumber: string;
	dateAdded: string;
	firstName?: string;
	id: string;
	industry: string;
	industryOther?: string;
	lastName?: string;
	middleName?: string;
	name: string;
	nextRenewalDate: string;
	nextRenewalHelper: string;
	paymentStatus: "Paid" | "Due";
	planDescription: string;
	planName: string;
	planStartDate: string;
	reportEndDate: string;
	reportStartDate: string;
	status: MasterSubscriberManagementCompanyStatus;
	storageAvailableGb: number;
	storageTotalGb: number;
	storageUsedGb: number;
	subscriberId: string;
	taxpayerType?: MasterSubscriberManagementTaxpayerType;
	tin: string;
	userCount: number;
	website: string;
};

export type MasterSubscriberManagementPromotionUsageRecord = {
	companyId: string;
	deductionAmount: number;
	id: string;
	invoiceNo: string;
	promotionId: string;
	subscriberId: string;
	usedAt: string;
};

export type MasterSubscriberManagementBranchRecord = {
	addedOn: string;
	address: string;
	contactNumber: string;
	email: string;
	id: string;
	isMain: boolean;
	linkedMainBranchId: string;
	name: string;
	status: MasterSubscriberManagementBranchStatus;
	tin: string;
	tone: "blue" | "cyan" | "orange" | "purple" | "rose";
	type: MasterSubscriberManagementBranchType;
	users: number;
};

export type MasterSubscriberManagementBranchFormValues = {
	address: string;
	contactNumber: string;
	email: string;
	isMain: boolean;
	linkedMainBranchId: string;
	name: string;
	status: MasterSubscriberManagementBranchStatus;
	tin: string;
	type: MasterSubscriberManagementBranchType;
};

export type MasterSubscriberManagementBranchFormErrors = Partial<
	Record<keyof MasterSubscriberManagementBranchFormValues | "form", string>
>;

export type MasterSubscriberManagementUserRecord = {
	addedOn: string;
	avatarTone: "blue" | "orange" | "purple" | "rose" | "slate";
	branchAccess: string[];
	email: string;
	id: string;
	initials: string;
	lastActiveDate: string;
	lastActiveTime: string;
	name: string;
	phone: string;
	status: MasterSubscriberManagementUserStatus;
};

export type MasterSubscriberManagementInvoiceRecord = {
	billingPeriod: string;
	date: string;
	description: string;
	id: string;
	originalAmount: number;
	status: "Paid" | "Due";
};

export type MasterSubscriberManagementActivityRecord = {
	date: string;
	id: string;
	label: string;
	tone: "blue" | "emerald" | "orange" | "purple";
};

export type MasterSubscriberManagementStorageBreakdownRecord = {
	category: string;
	colorClassName: string;
	iconClassName: string;
	percentage: number;
	used: string;
};

export type MasterSubscriberManagementStorageBranchRecord = {
	address: string;
	branch: string;
	files: string;
	id: string;
	lastActivity: string;
	percentage: number;
	tone: "blue" | "emerald" | "orange" | "purple" | "slate";
	used: string;
};

export type MasterSubscriberManagementFormValues = {
	contactNumber: string;
	email: string;
	name: string;
	status: MasterSubscriberManagementStatus;
};

export type MasterSubscriberManagementFormErrors = Partial<
	Record<keyof MasterSubscriberManagementFormValues | "form", string>
>;

export type MasterSubscriberManagementTableColumnKey = keyof Pick<
	MasterSubscriberManagementListRecord,
	| "branches"
	| "companies"
	| "contactNumber"
	| "dateRegisteredLabel"
	| "email"
	| "lastLoginDate"
	| "name"
	| "status"
	| "users"
>;
