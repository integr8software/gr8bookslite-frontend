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
	WorkspaceCompanyType,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { GetCalendarYearReportDates } from "@/app/src/data/onboarding/OnboardingData";

const DefaultWorkspaceCompanyReportYear = GetCalendarYearReportDates();

export const InitialWorkspaceCompanyFormValues: WorkspaceCompanyFormValues = {
	address: "",
	companyName: "",
	contactNumber: "",
	email: "",
	firstName: "",
	lastName: "",
	logoFile: null,
	logoName: "",
	logoUrl: "",
	middleName: "",
	nonIndividualType: "Corporation",
	nonIndividualTypeOther: "",
	plan: "Accounting + Inventory",
	reportEndDate: DefaultWorkspaceCompanyReportYear.reportEndDate,
	reportStartDate: DefaultWorkspaceCompanyReportYear.reportStartDate,
	status: "Active",
	taxpayerType: "non-individual",
	tin: "",
	website: "",
};

export const InitialWorkspaceCompanyUserFormValues: WorkspaceCompanyUserFormValues =
	{
		companyAssignments: [],
		contactNumber: "",
		email: "",
		name: "",
	};

export const InitialWorkspaceCompanyBranchFormValues: WorkspaceCompanyBranchFormValues =
	{
		address: "",
		branchType: "Branch",
		contactNumber: "",
		description: "",
		email: "",
		isMain: false,
		linkedMainBranchId: "",
		name: "",
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
		nonIndividualType: "Corporation",
		reportEndDate: "2026-12-31",
		reportStartDate: "2026-01-01",
		taxpayerType: "non-individual",
		tin: "123-456-789-000",
		website: "https://gr8books.test",
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
		nonIndividualType: "Corporation",
		reportEndDate: "2026-12-31",
		reportStartDate: "2026-01-01",
		taxpayerType: "non-individual",
		tin: "987-654-321-000",
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
		nonIndividualType: "Partnership",
		reportEndDate: "2026-12-31",
		reportStartDate: "2026-01-01",
		taxpayerType: "non-individual",
		tin: "456-100-200-000",
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
		nonIndividualType: "Corporation",
		reportEndDate: "2026-12-31",
		reportStartDate: "2026-01-01",
		taxpayerType: "non-individual",
		tin: "654-321-987-000",
	},
];

export const MockWorkspaceCompanyUsers: WorkspaceCompanyUserRecord[] = [
	{
		id: "cu-gr8-001",
		companyId: "cmp-gr8books",
		companyAssignments: [
			{ companyId: "cmp-gr8books", branchIds: ["br-gr8-main"] },
		],
		name: "John Dela Cruz",
		email: "john.delacruz@gr8books.test",
		contactNumber: "+63 916 460 4120",
		status: "Active",
		lastLogin: "May 21, 2026 08:45 AM",
		profileImageUrl:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
	},
	{
		id: "cu-gr8-002",
		companyId: "cmp-gr8books",
		companyAssignments: [
			{ companyId: "cmp-gr8books", branchIds: ["br-gr8-north"] },
		],
		name: "Jane Santos",
		email: "jane.santos@gr8books.test",
		contactNumber: "+63 917 120 3301",
		status: "Active",
		lastLogin: "May 20, 2026 10:20 AM",
		profileImageUrl:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
	},
	{
		id: "cu-gr8-003",
		companyId: "cmp-gr8books",
		companyAssignments: [
			{ companyId: "cmp-gr8books", branchIds: [] },
		],
		name: "Carlo Mendoza",
		email: "carlo.mendoza@gr8books.test",
		contactNumber: "+63 924 716 8830",
		status: "Active",
		lastLogin: "May 21, 2026 06:50 AM",
	},
	{
		id: "cu-demo-001",
		companyId: "cmp-demo-trading",
		companyAssignments: [
			{ companyId: "cmp-demo-trading", branchIds: ["br-demo-main"] },
		],
		name: "Alyssa Tan",
		email: "alyssa.tan@demotrading.test",
		contactNumber: "+63 925 613 4208",
		status: "Pending",
		lastLogin: "Invitation sent",
	},
	{
		id: "cu-cebu-001",
		companyId: "cmp-cebu-retail",
		companyAssignments: [
			{ companyId: "cmp-cebu-retail", branchIds: ["br-cebu-main"] },
		],
		name: "Daniel Wilson",
		email: "daniel.wilson@ceburetail.test",
		contactNumber: "+63 917 884 1209",
		status: "Active",
		lastLogin: "May 19, 2026 09:00 AM",
	},
];

export const MockWorkspaceCompanyBranches: WorkspaceCompanyBranchRecord[] = [
	{
		id: "br-gr8-main",
		companyId: "cmp-gr8books",
		code: "GH-MB",
		name: "Main Branch",
		branchType: "Branch",
		status: "Active",
		tin: "123-456-789-000",
		email: "main@gr8books.test",
		contactNumber: "+63 2 8123 4567",
		address: "Makati City, Metro Manila",
		description: "Primary operating branch for the company.",
		isMain: true,
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
		description: "Northern Metro Manila branch.",
		isMain: false,
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
		description: "Satellite site linked to Main Branch.",
		isMain: false,
		linkedMainBranchId: "br-gr8-main",
	},
	{
		id: "br-demo-main",
		companyId: "cmp-demo-trading",
		code: "DT-TH",
		name: "Trading HQ",
		branchType: "Branch",
		status: "Active",
		tin: "987-654-321-000",
		email: "hq@demotrading.test",
		contactNumber: "+63 2 8899 1000",
		address: "Pasig City, Metro Manila",
		description: "Main trading office.",
		isMain: true,
	},
	{
		id: "br-cebu-main",
		companyId: "cmp-cebu-retail",
		code: "CEB",
		name: "Cebu Central",
		branchType: "Branch",
		status: "Active",
		tin: "456-100-200-000",
		email: "central@ceburetail.test",
		contactNumber: "+63 32 410 1200",
		address: "Cebu City, Cebu",
		description: "Primary Cebu operating branch.",
		isMain: true,
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
	const taxpayerType = company.taxpayerType ?? "non-individual";

	return {
		address: company.address,
		companyName: taxpayerType === "non-individual" ? company.name : "",
		contactNumber: company.contactNumber,
		email: company.email,
		firstName: company.firstName ?? "",
		lastName: company.lastName ?? "",
		logoFile: null,
		logoName: company.logoUrl ? "Current logo" : "",
		logoUrl: company.logoUrl ?? "",
		middleName: company.middleName ?? "",
		nonIndividualType: company.nonIndividualType ?? company.companyType,
		nonIndividualTypeOther: company.nonIndividualTypeOther ?? "",
		plan: company.plan,
		reportEndDate:
			company.reportEndDate ?? DefaultWorkspaceCompanyReportYear.reportEndDate,
		reportStartDate:
			company.reportStartDate ??
			DefaultWorkspaceCompanyReportYear.reportStartDate,
		status: company.status,
		taxpayerType,
		tin: company.tin ?? "",
		website: company.website ?? "",
	};
}

export function createWorkspaceCompanyFromForm(
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyRecord {
	const trimmedValues = trimCompanyValues(values);
	const name = getWorkspaceCompanyDisplayName(trimmedValues);
	const companyType = getWorkspaceCompanyType(trimmedValues);

	return {
		address: trimmedValues.address,
		companyType,
		contactNumber: trimmedValues.contactNumber,
		email: trimmedValues.email,
		id: `cmp-${Date.now()}`,
		initials: getInitials(name),
		logoUrl: trimmedValues.logoUrl || undefined,
		name,
		plan: trimmedValues.plan,
		primaryContact: getWorkspaceCompanyPrimaryContact(trimmedValues),
		status: trimmedValues.status,
		createdAt: "May 21, 2026",
		firstName: trimmedValues.firstName || undefined,
		lastName: trimmedValues.lastName || undefined,
		middleName: trimmedValues.middleName || undefined,
		nonIndividualType: trimmedValues.nonIndividualType || undefined,
		nonIndividualTypeOther: trimmedValues.nonIndividualTypeOther || undefined,
		reportEndDate: trimmedValues.reportEndDate,
		reportStartDate: trimmedValues.reportStartDate,
		taxpayerType: trimmedValues.taxpayerType,
		tin: trimmedValues.tin,
		website: trimmedValues.website || undefined,
	};
}

export function updateWorkspaceCompanyFromForm(
	company: WorkspaceCompanyRecord,
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyRecord {
	const trimmedValues = trimCompanyValues(values);
	const name = getWorkspaceCompanyDisplayName(trimmedValues);
	const companyType = getWorkspaceCompanyType(trimmedValues);

	return {
		...company,
		address: trimmedValues.address,
		companyType,
		contactNumber: trimmedValues.contactNumber,
		email: trimmedValues.email,
		firstName: trimmedValues.firstName || undefined,
		initials: getInitials(name),
		lastName: trimmedValues.lastName || undefined,
		logoUrl: trimmedValues.logoUrl || undefined,
		middleName: trimmedValues.middleName || undefined,
		name,
		nonIndividualType: trimmedValues.nonIndividualType || undefined,
		nonIndividualTypeOther: trimmedValues.nonIndividualTypeOther || undefined,
		plan: trimmedValues.plan,
		primaryContact: getWorkspaceCompanyPrimaryContact(trimmedValues),
		reportEndDate: trimmedValues.reportEndDate,
		reportStartDate: trimmedValues.reportStartDate,
		status: trimmedValues.status,
		taxpayerType: trimmedValues.taxpayerType,
		tin: trimmedValues.tin,
		website: trimmedValues.website || undefined,
	};
}

export function validateWorkspaceCompanyForm(
	values: WorkspaceCompanyFormValues,
) {
	const errors: WorkspaceCompanyFormErrors = {};

	if (values.taxpayerType === "individual") {
		if (!values.lastName.trim()) errors.lastName = "Last name is required.";
		if (!values.firstName.trim()) errors.firstName = "First name is required.";
	} else {
		if (!values.companyName.trim()) errors.companyName = "Company name is required.";
		if (!values.nonIndividualType.trim()) {
			errors.nonIndividualType = "Organization type is required.";
		}
		if (
			values.nonIndividualType === "Others" &&
			!values.nonIndividualTypeOther.trim()
		) {
			errors.nonIndividualTypeOther = "Please specify the organization type.";
		}
	}
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}
	if (!values.address.trim()) errors.address = "Address is required.";
	if (!values.tin.trim()) errors.tin = "TIN is required.";
	if (!values.logoName.trim() && !values.logoUrl.trim()) {
		errors.logoName = "Upload a logo image.";
	}
	if (!values.reportStartDate) {
		errors.reportStartDate = "Report start date is required.";
	}
	if (!values.reportEndDate) {
		errors.reportEndDate = "Report end date is required.";
	}

	return errors;
}

export function createWorkspaceCompanyUserFormValues(
	user: WorkspaceCompanyUserRecord,
): WorkspaceCompanyUserFormValues {
	return {
		companyAssignments: user.companyAssignments,
		contactNumber: user.contactNumber,
		email: user.email,
		name: user.name,
	};
}

export function createWorkspaceCompanyUserFromForm(
	companyId: string,
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserRecord {
	return {
		...trimUserValues(values),
		companyId,
		companyAssignments: normalizeUserAssignments(values.companyAssignments, companyId),
		id: `cu-${Date.now()}`,
		lastLogin: "Invitation sent",
		status: "Pending",
	};
}

export function updateWorkspaceCompanyUserFromForm(
	user: WorkspaceCompanyUserRecord,
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserRecord {
	return {
		...user,
		...trimUserValues(values),
		companyAssignments: normalizeUserAssignments(
			values.companyAssignments,
			user.companyId,
		),
	};
}

export function validateWorkspaceCompanyUserForm(
	values: WorkspaceCompanyUserFormValues,
) {
	const errors: WorkspaceCompanyUserFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (values.companyAssignments.length === 0) {
		errors.companyAssignments = "Add at least one company.";
	}

	return errors;
}

export function createWorkspaceCompanyBranchFormValues(
	branch: WorkspaceCompanyBranchRecord,
): WorkspaceCompanyBranchFormValues {
	return {
		address: branch.address,
		branchType: branch.branchType,
		contactNumber: branch.contactNumber,
		description: branch.description,
		email: branch.email,
		isMain: branch.isMain,
		linkedMainBranchId: branch.linkedMainBranchId ?? "",
		name: branch.name,
		tin: branch.branchType === "Satellite" ? "" : branch.tin,
	};
}

export function createWorkspaceCompanyBranchFromForm(
	company: WorkspaceCompanyRecord,
	companyId: string,
	values: WorkspaceCompanyBranchFormValues,
	mainBranch?: WorkspaceCompanyBranchRecord,
): WorkspaceCompanyBranchRecord {
	const trimmedValues = trimBranchValues(values);
	const tin =
		trimmedValues.branchType === "Satellite"
			? (mainBranch?.tin ?? "").trim()
			: trimmedValues.tin;

	return {
		...trimmedValues,
		companyId,
		code: createWorkspaceBranchCode(company.initials, trimmedValues.name),
		id: `br-${Date.now()}`,
		isMain: trimmedValues.branchType === "Branch" ? trimmedValues.isMain : false,
		linkedMainBranchId:
			trimmedValues.branchType === "Satellite"
				? trimmedValues.linkedMainBranchId
				: undefined,
		status: "Active",
		tin,
	};
}

export function updateWorkspaceCompanyBranchFromForm(
	branch: WorkspaceCompanyBranchRecord,
	company: WorkspaceCompanyRecord,
	values: WorkspaceCompanyBranchFormValues,
	mainBranch?: WorkspaceCompanyBranchRecord,
): WorkspaceCompanyBranchRecord {
	const nextBranch = createWorkspaceCompanyBranchFromForm(
		company,
		branch.companyId,
		values,
		mainBranch,
	);

	return {
		...branch,
		...nextBranch,
		id: branch.id,
		status: branch.status,
	};
}

export function validateWorkspaceCompanyBranchForm(
	values: WorkspaceCompanyBranchFormValues,
) {
	const errors: WorkspaceCompanyBranchFormErrors = {};

	if (!values.name.trim()) errors.name = "Branch name is required.";
	if (values.branchType === "Satellite") {
		if (!values.linkedMainBranchId) {
			errors.linkedMainBranchId = "Select the main branch TIN.";
		}
	} else if (!values.tin.trim()) {
		errors.tin = "TIN is required for a branch.";
	}

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
		companyName: values.companyName.trim(),
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		firstName: values.firstName.trim(),
		lastName: values.lastName.trim(),
		logoName: values.logoName.trim(),
		logoUrl: values.logoUrl?.trim() ?? "",
		middleName: values.middleName.trim(),
		nonIndividualType: values.nonIndividualType.trim(),
		nonIndividualTypeOther: values.nonIndividualTypeOther.trim(),
		reportEndDate: values.reportEndDate.trim(),
		reportStartDate: values.reportStartDate.trim(),
		tin: values.tin.trim(),
		website: values.website.trim(),
	};
}

function getWorkspaceCompanyDisplayName(values: WorkspaceCompanyFormValues) {
	if (values.taxpayerType === "individual") {
		return [values.firstName, values.middleName, values.lastName]
			.filter(Boolean)
			.join(" ");
	}

	return values.companyName;
}

function getWorkspaceCompanyPrimaryContact(values: WorkspaceCompanyFormValues) {
	if (values.taxpayerType === "individual") {
		return getWorkspaceCompanyDisplayName(values);
	}

	return values.companyName;
}

function getWorkspaceCompanyType(
	values: WorkspaceCompanyFormValues,
): WorkspaceCompanyType {
	if (values.taxpayerType === "individual") {
		return "Individual";
	}

	const resolvedType =
		values.nonIndividualType === "Others"
			? "Others"
			: values.nonIndividualType;

	return resolvedType as WorkspaceCompanyType;
}

function trimUserValues(
	values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserFormValues {
	return {
		...values,
		companyAssignments: values.companyAssignments.map((assignment) => ({
			companyId: assignment.companyId,
			branchIds: assignment.branchIds,
		})),
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		name: values.name.trim(),
	};
}

function normalizeUserAssignments(
	assignments: WorkspaceCompanyUserFormValues["companyAssignments"],
	fallbackCompanyId: string,
) {
	const normalizedAssignments =
		assignments.length > 0
			? assignments
			: [{ companyId: fallbackCompanyId, branchIds: [] }];

	return normalizedAssignments.map((assignment) => ({
		companyId: assignment.companyId,
		branchIds: Array.from(new Set(assignment.branchIds)),
	}));
}

function trimBranchValues(
	values: WorkspaceCompanyBranchFormValues,
): WorkspaceCompanyBranchFormValues {
	return {
		...values,
		address: values.address.trim(),
		contactNumber: values.contactNumber.trim(),
		description: values.description.trim(),
		email: values.email.trim(),
		linkedMainBranchId: values.linkedMainBranchId.trim(),
		name: values.name.trim(),
		tin: values.tin.trim(),
	};
}

function createWorkspaceBranchCode(companyInitials: string, name: string) {
	const companyPrefix = companyInitials.trim().toUpperCase();
	const namePrefix = name
		.trim()
		.split(/\s+/)
		.map((part) => part.replace(/[^A-Za-z0-9]/g, "").charAt(0))
		.filter(Boolean)
		.join("")
		.slice(0, 4)
		.toUpperCase();

	return [companyPrefix, namePrefix || "BR"].filter(Boolean).join("-");
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
