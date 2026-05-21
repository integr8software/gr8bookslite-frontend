import type {
	WorkspaceBranchUserFormErrors,
	WorkspaceBranchUserFormValues,
	WorkspaceBranchUserRecord,
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";

export const InitialWorkspaceCompanyFormValues: WorkspaceCompanyFormValues = {
	address: "",
	companyType: "Corporation",
	contactNumber: "",
	email: "",
	logoUrl: "",
	name: "",
	plan: "Accounting + Inventory",
	primaryContact: "",
	status: "Active",
};

export const InitialWorkspaceCompanyUserFormValues: WorkspaceCompanyUserFormValues =
	{
		contactNumber: "",
		email: "",
		name: "",
		role: "Company Admin",
		status: "Active",
	};

export const InitialWorkspaceCompanyBranchFormValues: WorkspaceCompanyBranchFormValues =
	{
		address: "",
		branchType: "Branch",
		code: "",
		contactNumber: "",
		email: "",
		name: "",
		status: "Active",
		tin: "",
	};

export const InitialWorkspaceBranchUserFormValues: WorkspaceBranchUserFormValues =
	{
		contactNumber: "",
		email: "",
		name: "",
		role: "Branch Admin",
		status: "Active",
	};

export const MockWorkspaceCompanies: WorkspaceCompanyRecord[] = [
	{
		id: "cmp-gr8books",
		name: "Gr8Books HQ",
		initials: "GH",
		logoUrl: "/img/company-background.jpg",
		companyType: "Corporation",
		plan: "Accounting + Inventory",
		status: "Active",
		email: "admin@gr8books.test",
		contactNumber: "+63 917 120 3301",
		address: "Makati City, Metro Manila",
		primaryContact: "John Dela Cruz",
		createdAt: "May 01, 2026",
	},
	{
		id: "cmp-demo-trading",
		name: "Demo Trading Corp.",
		initials: "DT",
		companyType: "Corporation",
		plan: "Accounting",
		status: "Active",
		email: "finance@demotrading.test",
		contactNumber: "+63 918 221 3388",
		address: "Quezon City, Metro Manila",
		primaryContact: "Jane Santos",
		createdAt: "May 05, 2026",
	},
	{
		id: "cmp-cebu-retail",
		name: "Cebu Retail Partners",
		initials: "CR",
		companyType: "Partnership",
		plan: "Inventory",
		status: "Active",
		email: "ops@ceburetail.test",
		contactNumber: "+63 919 443 7902",
		address: "Cebu City, Cebu",
		primaryContact: "Michael Reyes",
		createdAt: "May 08, 2026",
	},
	{
		id: "cmp-laguna-manufacturing",
		name: "Laguna Manufacturing Inc.",
		initials: "LM",
		companyType: "Corporation",
		plan: "Accounting + Inventory",
		status: "Inactive",
		email: "control@lagunamfg.test",
		contactNumber: "+63 920 115 8364",
		address: "Santa Rosa, Laguna",
		primaryContact: "Emily Lim",
		createdAt: "May 10, 2026",
	},
];

export const MockWorkspaceCompanyUsers: WorkspaceCompanyUserRecord[] = [
	{
		id: "cu-gr8-001",
		companyId: "cmp-gr8books",
		name: "John Dela Cruz",
		email: "john.delacruz@gr8books.test",
		contactNumber: "+63 916 460 4120",
		role: "Company Admin",
		status: "Active",
		lastLogin: "May 21, 2026 08:45 AM",
		profileImageUrl:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
	},
	{
		id: "cu-gr8-002",
		companyId: "cmp-gr8books",
		name: "Jane Santos",
		email: "jane.santos@gr8books.test",
		contactNumber: "+63 917 120 3301",
		role: "Accountant",
		status: "Active",
		lastLogin: "May 20, 2026 10:20 AM",
		profileImageUrl:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
	},
	{
		id: "cu-gr8-003",
		companyId: "cmp-gr8books",
		name: "Carlo Mendoza",
		email: "carlo.mendoza@gr8books.test",
		contactNumber: "+63 924 716 8830",
		role: "Approver",
		status: "Active",
		lastLogin: "May 21, 2026 06:50 AM",
	},
	{
		id: "cu-demo-001",
		companyId: "cmp-demo-trading",
		name: "Alyssa Tan",
		email: "alyssa.tan@demotrading.test",
		contactNumber: "+63 925 613 4208",
		role: "Company Admin",
		status: "Pending",
		lastLogin: "Invitation sent",
	},
	{
		id: "cu-cebu-001",
		companyId: "cmp-cebu-retail",
		name: "Daniel Wilson",
		email: "daniel.wilson@ceburetail.test",
		contactNumber: "+63 917 884 1209",
		role: "Bookkeeper",
		status: "Active",
		lastLogin: "May 19, 2026 09:00 AM",
	},
];

export const MockWorkspaceCompanyBranches: WorkspaceCompanyBranchRecord[] = [
	{
		id: "br-gr8-main",
		companyId: "cmp-gr8books",
		code: "MAIN",
		name: "Main Branch",
		branchType: "Head Office",
		status: "Active",
		tin: "123-456-789-000",
		email: "main@gr8books.test",
		contactNumber: "+63 2 8123 4567",
		address: "Makati City, Metro Manila",
	},
	{
		id: "br-gr8-north",
		companyId: "cmp-gr8books",
		code: "NORTH",
		name: "North Branch",
		branchType: "Branch",
		status: "Active",
		tin: "123-456-789-001",
		email: "north@gr8books.test",
		contactNumber: "+63 2 8123 8899",
		address: "Quezon City, Metro Manila",
	},
	{
		id: "br-gr8-cebu",
		companyId: "cmp-gr8books",
		code: "CEB",
		name: "Cebu Satellite",
		branchType: "Satellite",
		status: "Active",
		tin: "123-456-789-000",
		email: "cebu@gr8books.test",
		contactNumber: "+63 32 412 7788",
		address: "Cebu City, Cebu",
	},
	{
		id: "br-demo-main",
		companyId: "cmp-demo-trading",
		code: "HQ",
		name: "Trading HQ",
		branchType: "Head Office",
		status: "Active",
		tin: "987-654-321-000",
		email: "hq@demotrading.test",
		contactNumber: "+63 2 8899 1000",
		address: "Pasig City, Metro Manila",
	},
	{
		id: "br-cebu-main",
		companyId: "cmp-cebu-retail",
		code: "CEB",
		name: "Cebu Central",
		branchType: "Head Office",
		status: "Active",
		tin: "456-100-200-000",
		email: "central@ceburetail.test",
		contactNumber: "+63 32 410 1200",
		address: "Cebu City, Cebu",
	},
];

export const MockWorkspaceBranchUsers: WorkspaceBranchUserRecord[] = [
	{
		id: "bu-gr8-main-001",
		companyId: "cmp-gr8books",
		branchId: "br-gr8-main",
		name: "John Dela Cruz",
		email: "john.main@gr8books.test",
		contactNumber: "+63 916 460 4120",
		role: "Branch Admin",
		status: "Active",
		assignedAt: "May 12, 2026",
	},
	{
		id: "bu-gr8-main-002",
		companyId: "cmp-gr8books",
		branchId: "br-gr8-main",
		name: "Rhea Garcia",
		email: "rhea.garcia@gr8books.test",
		contactNumber: "+63 927 112 3021",
		role: "Cashier",
		status: "Active",
		assignedAt: "May 13, 2026",
	},
	{
		id: "bu-gr8-north-001",
		companyId: "cmp-gr8books",
		branchId: "br-gr8-north",
		name: "Jane Santos",
		email: "jane.north@gr8books.test",
		contactNumber: "+63 917 120 3301",
		role: "Branch Accountant",
		status: "Active",
		assignedAt: "May 14, 2026",
	},
	{
		id: "bu-demo-main-001",
		companyId: "cmp-demo-trading",
		branchId: "br-demo-main",
		name: "Alyssa Tan",
		email: "alyssa.hq@demotrading.test",
		contactNumber: "+63 925 613 4208",
		role: "Encoder",
		status: "Active",
		assignedAt: "May 15, 2026",
	},
];

export function createWorkspaceCompanyFormValues(
	company: WorkspaceCompanyRecord,
): WorkspaceCompanyFormValues {
	return {
		address: company.address,
		companyType: company.companyType,
		contactNumber: company.contactNumber,
		email: company.email,
		logoUrl: company.logoUrl ?? "",
		name: company.name,
		plan: company.plan,
		primaryContact: company.primaryContact,
		status: company.status,
	};
}

export function createWorkspaceCompanyFromForm(
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyRecord {
	const trimmedValues = trimCompanyValues(values);

	return {
		...trimmedValues,
		id: `cmp-${Date.now()}`,
		initials: getInitials(trimmedValues.name),
		logoUrl: trimmedValues.logoUrl || undefined,
		createdAt: "May 21, 2026",
	};
}

export function updateWorkspaceCompanyFromForm(
	company: WorkspaceCompanyRecord,
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyRecord {
	const trimmedValues = trimCompanyValues(values);

	return {
		...company,
		...trimmedValues,
		initials: getInitials(trimmedValues.name),
		logoUrl: trimmedValues.logoUrl || undefined,
	};
}

export function validateWorkspaceCompanyForm(
	values: WorkspaceCompanyFormValues,
) {
	const errors: WorkspaceCompanyFormErrors = {};

	if (!values.name.trim()) errors.name = "Company name is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}
	if (!values.primaryContact.trim()) {
		errors.primaryContact = "Primary contact is required.";
	}
	if (!values.address.trim()) errors.address = "Address is required.";

	return errors;
}

export function createWorkspaceCompanyUserFormValues(
	user: WorkspaceCompanyUserRecord,
): WorkspaceCompanyUserFormValues {
	return {
		contactNumber: user.contactNumber,
		email: user.email,
		name: user.name,
		role: user.role,
		status: user.status,
	};
}

export function createWorkspaceCompanyUserFromForm(
	companyId: string,
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserRecord {
	return {
		...trimUserValues(values),
		companyId,
		id: `cu-${Date.now()}`,
		lastLogin: "Invitation sent",
	};
}

export function updateWorkspaceCompanyUserFromForm(
	user: WorkspaceCompanyUserRecord,
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserRecord {
	return {
		...user,
		...trimUserValues(values),
	};
}

export function validateWorkspaceCompanyUserForm(
	values: WorkspaceCompanyUserFormValues,
) {
	const errors: WorkspaceCompanyUserFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}

	return errors;
}

export function createWorkspaceCompanyBranchFormValues(
	branch: WorkspaceCompanyBranchRecord,
): WorkspaceCompanyBranchFormValues {
	return {
		address: branch.address,
		branchType: branch.branchType,
		code: branch.code,
		contactNumber: branch.contactNumber,
		email: branch.email,
		name: branch.name,
		status: branch.status,
		tin: branch.tin,
	};
}

export function createWorkspaceCompanyBranchFromForm(
	companyId: string,
	values: WorkspaceCompanyBranchFormValues,
): WorkspaceCompanyBranchRecord {
	return {
		...trimBranchValues(values),
		companyId,
		id: `br-${Date.now()}`,
	};
}

export function updateWorkspaceCompanyBranchFromForm(
	branch: WorkspaceCompanyBranchRecord,
	values: WorkspaceCompanyBranchFormValues,
): WorkspaceCompanyBranchRecord {
	return {
		...branch,
		...trimBranchValues(values),
		code: values.code.trim().toUpperCase(),
	};
}

export function validateWorkspaceCompanyBranchForm(
	values: WorkspaceCompanyBranchFormValues,
) {
	const errors: WorkspaceCompanyBranchFormErrors = {};

	if (!values.code.trim()) errors.code = "Code is required.";
	if (!values.name.trim()) errors.name = "Branch name is required.";
	if (!values.tin.trim()) errors.tin = "TIN is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}
	if (!values.address.trim()) errors.address = "Address is required.";

	return errors;
}

export function createWorkspaceBranchUserFormValues(
	user: WorkspaceBranchUserRecord,
): WorkspaceBranchUserFormValues {
	return {
		contactNumber: user.contactNumber,
		email: user.email,
		name: user.name,
		role: user.role,
		status: user.status,
	};
}

export function createWorkspaceBranchUserFromForm(
	companyId: string,
	branchId: string,
	values: WorkspaceBranchUserFormValues,
): WorkspaceBranchUserRecord {
	return {
		...trimBranchUserValues(values),
		branchId,
		companyId,
		id: `bu-${Date.now()}`,
		assignedAt: "May 21, 2026",
	};
}

export function updateWorkspaceBranchUserFromForm(
	user: WorkspaceBranchUserRecord,
	values: WorkspaceBranchUserFormValues,
): WorkspaceBranchUserRecord {
	return {
		...user,
		...trimBranchUserValues(values),
	};
}

export function validateWorkspaceBranchUserForm(
	values: WorkspaceBranchUserFormValues,
) {
	const errors: WorkspaceBranchUserFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}

	return errors;
}

export function getNextWorkspaceCompanyStatus(
	status: WorkspaceCompanyStatus,
): WorkspaceCompanyStatus {
	return status === "Inactive" ? "Active" : "Inactive";
}

function trimCompanyValues(
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyFormValues {
	return {
		...values,
		address: values.address.trim(),
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		logoUrl: values.logoUrl?.trim() ?? "",
		name: values.name.trim(),
		primaryContact: values.primaryContact.trim(),
	};
}

function trimUserValues(
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserFormValues {
	return {
		...values,
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		name: values.name.trim(),
	};
}

function trimBranchValues(
	values: WorkspaceCompanyBranchFormValues,
): WorkspaceCompanyBranchFormValues {
	return {
		...values,
		address: values.address.trim(),
		code: values.code.trim().toUpperCase(),
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		name: values.name.trim(),
		tin: values.tin.trim(),
	};
}

function trimBranchUserValues(
	values: WorkspaceBranchUserFormValues,
): WorkspaceBranchUserFormValues {
	return {
		...values,
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		name: values.name.trim(),
	};
}

function getInitials(name: string) {
	const words = name
		.split(/\s+/)
		.map((word) => word.trim())
		.filter(Boolean);

	return words
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
}
