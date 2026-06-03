export type MasterTenantAccessEntity =
	| "subscriber"
	| "company"
	| "branch"
	| "user";

export type MasterTenantAccessActionMode = "add" | "edit" | "view";

export type MasterTenantAccessStatus =
	| "Active"
	| "Trial"
	| "Past Due"
	| "Suspended"
	| "Inactive"
	| "Pending Setup";

export type MasterTenantAccessSubscriberStatus = Exclude<
	MasterTenantAccessStatus,
	"Trial" | "Past Due"
>;

export type MasterTenantAccessBranchType =
	| "Head Office"
	| "Branch"
	| "Satellite";

export type MasterTenantAccessUserRole =
	| "Owner"
	| "Company Admin"
	| "Branch Manager"
	| "Accountant"
	| "Viewer";

export type MasterTenantAccessUserAssignment = {
	branchIds: string[];
	companyId: string;
	role: MasterTenantAccessUserRole;
};

export type MasterSubscriberRecord = {
	code: string;
	contactNumber: string;
	createdAt: string;
	id: string;
	name: string;
	notes: string;
	ownerEmail: string;
	ownerName: string;
	status: MasterTenantAccessSubscriberStatus;
};

export type MasterCompanyRecord = {
	address: string;
	code: string;
	contactNumber: string;
	createdAt: string;
	defaultBranchName: string;
	email: string;
	id: string;
	legalName: string;
	planName: string;
	status: MasterTenantAccessStatus;
	subscriberId: string;
	taxId: string;
	tradeName: string;
};

export type MasterBranchRecord = {
	address: string;
	branchType: MasterTenantAccessBranchType;
	code: string;
	companyId: string;
	contactNumber: string;
	email: string;
	id: string;
	isMain: boolean;
	linkedMainBranchId: string;
	name: string;
	status: MasterTenantAccessStatus;
	tin: string;
};

export type MasterUserRecord = {
	assignments: MasterTenantAccessUserAssignment[];
	contactNumber: string;
	email: string;
	id: string;
	lastLogin: string;
	name: string;
	status: MasterTenantAccessStatus;
	subscriberId: string;
};

export type MasterSubscriberFormValues = {
	contactNumber: string;
	name: string;
	notes: string;
	ownerEmail: string;
	ownerName: string;
	status: MasterTenantAccessSubscriberStatus;
};

export type MasterCompanyFormValues = {
	address: string;
	contactNumber: string;
	defaultBranchName: string;
	email: string;
	legalName: string;
	planName: string;
	status: MasterTenantAccessStatus;
	subscriberId: string;
	taxId: string;
	tradeName: string;
};

export type MasterBranchFormValues = {
	address: string;
	branchType: MasterTenantAccessBranchType;
	companyId: string;
	contactNumber: string;
	email: string;
	isMain: boolean;
	linkedMainBranchId: string;
	name: string;
	status: MasterTenantAccessStatus;
	tin: string;
};

export type MasterUserFormValues = {
	assignments: MasterTenantAccessUserAssignment[];
	contactNumber: string;
	email: string;
	name: string;
	status: MasterTenantAccessStatus;
	subscriberId: string;
};

export type MasterTenantAccessFormValues =
	| MasterSubscriberFormValues
	| MasterCompanyFormValues
	| MasterBranchFormValues
	| MasterUserFormValues;

export type MasterTenantAccessFormErrors = Partial<
	Record<string, string>
>;

export type MasterTenantAccessListRecord = {
	countA: number | string;
	countB: number | string;
	dateText: string;
	detailText: string;
	entity: MasterTenantAccessEntity;
	id: string;
	primaryText: string;
	record:
		| MasterSubscriberRecord
		| MasterCompanyRecord
		| MasterBranchRecord
		| MasterUserRecord;
	relationName: string;
	relationText: string;
	secondaryText: string;
	status: MasterTenantAccessStatus;
};

export type MasterTenantAccessMetric = {
	helper: string;
	label: string;
	value: number | string;
};
