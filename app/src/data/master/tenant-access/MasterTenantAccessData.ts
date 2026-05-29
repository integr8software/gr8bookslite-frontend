import type {
	MasterBranchFormValues,
	MasterBranchRecord,
	MasterCompanyFormValues,
	MasterCompanyRecord,
	MasterSubscriberFormValues,
	MasterSubscriberRecord,
	MasterTenantAccessBranchType,
	MasterTenantAccessEntity,
	MasterTenantAccessListRecord,
	MasterTenantAccessMetric,
	MasterTenantAccessUserAssignment,
	MasterUserFormValues,
	MasterUserRecord,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";

export const MasterTenantAccessSubscribers: MasterSubscriberRecord[] = [
	{
		billingStatus: "Current",
		code: "SUB-0001",
		contactNumber: "+63 917 100 0001",
		createdAt: "2026-05-01",
		id: "sub-gr8books",
		name: "Gr8Books HQ",
		nextRenewalDate: "2027-05-01",
		notes: "Launch subscriber with Accounting and Inventory enabled.",
		ownerEmail: "admin@gr8books.test",
		ownerName: "John Dela Cruz",
		planName: "Accounting + Inventory",
		primaryCompanyId: "cmp-gr8books",
		status: "Active",
	},
	{
		billingStatus: "Trial",
		code: "SUB-0002",
		contactNumber: "+63 917 100 0002",
		createdAt: "2026-05-05",
		id: "sub-demo-trading",
		name: "Demo Trading Corp.",
		nextRenewalDate: "2026-06-05",
		notes: "Trial account used for implementation demos.",
		ownerEmail: "finance@demotrading.test",
		ownerName: "Jane Santos",
		planName: "Accounting",
		primaryCompanyId: "cmp-demo-trading",
		status: "Trial",
	},
	{
		billingStatus: "Payment Due",
		code: "SUB-0003",
		contactNumber: "+63 917 100 0003",
		createdAt: "2026-05-10",
		id: "sub-laguna-manufacturing",
		name: "Laguna Manufacturing Inc.",
		nextRenewalDate: "2026-05-28",
		notes: "Needs payment follow-up before enabling extra users.",
		ownerEmail: "control@lagunamfg.test",
		ownerName: "Emily Lim",
		planName: "Full Suite Annual",
		primaryCompanyId: "cmp-laguna-manufacturing",
		status: "Past Due",
	},
	{
		billingStatus: "Setup",
		code: "SUB-0004",
		contactNumber: "+63 917 100 0004",
		createdAt: "2026-05-18",
		id: "sub-visayas-retail",
		name: "Visayas Retail Group",
		nextRenewalDate: "2026-06-18",
		notes: "New subscriber waiting for branch rollout.",
		ownerEmail: "ops@visayasretail.test",
		ownerName: "Miguel Reyes",
		planName: "Inventory",
		primaryCompanyId: "cmp-visayas-retail",
		status: "Pending Setup",
	},
];

export const MasterTenantAccessCompanies: MasterCompanyRecord[] = [
	{
		address: "Makati City, Metro Manila",
		code: "CMP-0001",
		contactNumber: "+63 2 8000 0001",
		createdAt: "2026-05-01",
		defaultBranchName: "Head Office",
		email: "admin@gr8books.test",
		id: "cmp-gr8books",
		legalName: "Gr8Books HQ",
		planName: "Accounting + Inventory",
		status: "Active",
		subscriberId: "sub-gr8books",
		taxId: "000-000-001-000",
		tradeName: "Gr8Books",
	},
	{
		address: "Bonifacio Global City, Taguig",
		code: "CMP-0002",
		contactNumber: "+63 2 8000 0002",
		createdAt: "2026-05-03",
		defaultBranchName: "Implementation Office",
		email: "implementation@gr8books.test",
		id: "cmp-gr8books-implementation",
		legalName: "Gr8Books Implementation Services",
		planName: "Accounting + Inventory",
		status: "Active",
		subscriberId: "sub-gr8books",
		taxId: "000-000-001-001",
		tradeName: "Implementation",
	},
	{
		address: "Quezon City, Metro Manila",
		code: "CMP-0003",
		contactNumber: "+63 2 8000 0003",
		createdAt: "2026-05-05",
		defaultBranchName: "Main Office",
		email: "finance@demotrading.test",
		id: "cmp-demo-trading",
		legalName: "Demo Trading Corp.",
		planName: "Accounting",
		status: "Trial",
		subscriberId: "sub-demo-trading",
		taxId: "000-000-002-000",
		tradeName: "Demo Trading",
	},
	{
		address: "Calamba, Laguna",
		code: "CMP-0004",
		contactNumber: "+63 49 500 0001",
		createdAt: "2026-05-10",
		defaultBranchName: "Plant Office",
		email: "control@lagunamfg.test",
		id: "cmp-laguna-manufacturing",
		legalName: "Laguna Manufacturing Inc.",
		planName: "Full Suite Annual",
		status: "Past Due",
		subscriberId: "sub-laguna-manufacturing",
		taxId: "000-000-003-000",
		tradeName: "Laguna Manufacturing",
	},
	{
		address: "Iloilo City, Iloilo",
		code: "CMP-0005",
		contactNumber: "+63 33 500 0001",
		createdAt: "2026-05-18",
		defaultBranchName: "Iloilo Main",
		email: "ops@visayasretail.test",
		id: "cmp-visayas-retail",
		legalName: "Visayas Retail Group",
		planName: "Inventory",
		status: "Pending Setup",
		subscriberId: "sub-visayas-retail",
		taxId: "000-000-004-000",
		tradeName: "Visayas Retail",
	},
	{
		address: "Cebu City, Cebu",
		code: "CMP-0006",
		contactNumber: "+63 32 500 0001",
		createdAt: "2026-05-20",
		defaultBranchName: "Cebu Main",
		email: "cebu@visayasretail.test",
		id: "cmp-visayas-retail-cebu",
		legalName: "Visayas Retail Cebu Inc.",
		planName: "Inventory",
		status: "Pending Setup",
		subscriberId: "sub-visayas-retail",
		taxId: "000-000-004-001",
		tradeName: "Visayas Retail Cebu",
	},
];

export const MasterTenantAccessBranches: MasterBranchRecord[] = [
	createBranch("br-gr8books-hq", "cmp-gr8books", "BR-0001", "Head Office", "Head Office", true, "000-000-001-000"),
	createBranch("br-gr8books-cebu", "cmp-gr8books", "BR-0002", "Cebu Branch", "Branch", false, "000-000-001-002"),
	createBranch("br-gr8books-implementation", "cmp-gr8books-implementation", "BR-0003", "Implementation Office", "Head Office", true, "000-000-001-001"),
	createBranch("br-demo-main", "cmp-demo-trading", "BR-0004", "Main Office", "Head Office", true, "000-000-002-000"),
	createBranch("br-laguna-plant", "cmp-laguna-manufacturing", "BR-0005", "Plant Office", "Head Office", true, "000-000-003-000"),
	createBranch("br-laguna-warehouse", "cmp-laguna-manufacturing", "BR-0006", "Warehouse Satellite", "Satellite", false, "000-000-003-001"),
	createBranch("br-visayas-iloilo", "cmp-visayas-retail", "BR-0007", "Iloilo Main", "Head Office", true, "000-000-004-000"),
	createBranch("br-visayas-cebu", "cmp-visayas-retail-cebu", "BR-0008", "Cebu Main", "Head Office", true, "000-000-004-001"),
];

export const MasterTenantAccessUsers: MasterUserRecord[] = [
	{
		assignments: [
			{
				branchIds: ["br-gr8books-hq", "br-gr8books-cebu"],
				companyId: "cmp-gr8books",
				role: "Owner",
			},
			{
				branchIds: ["br-gr8books-implementation"],
				companyId: "cmp-gr8books-implementation",
				role: "Company Admin",
			},
		],
		contactNumber: "+63 917 200 0001",
		email: "admin@gr8books.test",
		id: "usr-john-dela-cruz",
		lastLogin: "2026-05-29",
		name: "John Dela Cruz",
		status: "Active",
		subscriberId: "sub-gr8books",
	},
	{
		assignments: [
			{
				branchIds: ["br-demo-main"],
				companyId: "cmp-demo-trading",
				role: "Owner",
			},
		],
		contactNumber: "+63 917 200 0002",
		email: "jane@demotrading.test",
		id: "usr-jane-santos",
		lastLogin: "2026-05-28",
		name: "Jane Santos",
		status: "Trial",
		subscriberId: "sub-demo-trading",
	},
	{
		assignments: [
			{
				branchIds: ["br-laguna-plant", "br-laguna-warehouse"],
				companyId: "cmp-laguna-manufacturing",
				role: "Company Admin",
			},
		],
		contactNumber: "+63 917 200 0003",
		email: "emily@lagunamfg.test",
		id: "usr-emily-lim",
		lastLogin: "2026-05-24",
		name: "Emily Lim",
		status: "Past Due",
		subscriberId: "sub-laguna-manufacturing",
	},
	{
		assignments: [
			{
				branchIds: ["br-visayas-iloilo", "br-visayas-cebu"],
				companyId: "cmp-visayas-retail",
				role: "Owner",
			},
		],
		contactNumber: "+63 917 200 0004",
		email: "miguel@visayasretail.test",
		id: "usr-miguel-reyes",
		lastLogin: "",
		name: "Miguel Reyes",
		status: "Pending Setup",
		subscriberId: "sub-visayas-retail",
	},
];

export const InitialMasterSubscriberFormValues: MasterSubscriberFormValues = {
	contactNumber: "",
	initialCompanyEmail: "",
	initialCompanyName: "",
	initialCompanyTin: "",
	name: "",
	notes: "",
	ownerEmail: "",
	ownerName: "",
	planName: "Accounting + Inventory",
	status: "Active",
};

export const InitialMasterCompanyFormValues: MasterCompanyFormValues = {
	address: "",
	contactNumber: "",
	defaultBranchName: "Head Office",
	email: "",
	legalName: "",
	planName: "Accounting + Inventory",
	status: "Active",
	subscriberId: "",
	taxId: "",
	tradeName: "",
};

export const InitialMasterBranchFormValues: MasterBranchFormValues = {
	address: "",
	branchType: "Head Office",
	companyId: "",
	contactNumber: "",
	email: "",
	isMain: true,
	linkedMainBranchId: "",
	name: "",
	status: "Active",
	tin: "",
};

export const InitialMasterUserFormValues: MasterUserFormValues = {
	assignments: [],
	contactNumber: "",
	email: "",
	name: "",
	status: "Active",
	subscriberId: "",
};

export function createMasterSubscriberFormValues(
	record: MasterSubscriberRecord,
	companies: MasterCompanyRecord[],
): MasterSubscriberFormValues {
	const initialCompany = companies.find(
		(company) => company.id === record.primaryCompanyId,
	);

	return {
		contactNumber: record.contactNumber,
		initialCompanyEmail: initialCompany?.email ?? "",
		initialCompanyName: initialCompany?.legalName ?? "",
		initialCompanyTin: initialCompany?.taxId ?? "",
		name: record.name,
		notes: record.notes,
		ownerEmail: record.ownerEmail,
		ownerName: record.ownerName,
		planName: record.planName,
		status: record.status,
	};
}

export function createMasterCompanyFormValues(
	record: MasterCompanyRecord,
): MasterCompanyFormValues {
	return {
		address: record.address,
		contactNumber: record.contactNumber,
		defaultBranchName: record.defaultBranchName,
		email: record.email,
		legalName: record.legalName,
		planName: record.planName,
		status: record.status,
		subscriberId: record.subscriberId,
		taxId: record.taxId,
		tradeName: record.tradeName,
	};
}

export function createMasterBranchFormValues(
	record: MasterBranchRecord,
): MasterBranchFormValues {
	return {
		address: record.address,
		branchType: record.branchType,
		companyId: record.companyId,
		contactNumber: record.contactNumber,
		email: record.email,
		isMain: record.isMain,
		linkedMainBranchId: record.linkedMainBranchId,
		name: record.name,
		status: record.status,
		tin: record.tin,
	};
}

export function createMasterUserFormValues(
	record: MasterUserRecord,
): MasterUserFormValues {
	return {
		assignments: record.assignments.map((assignment) => ({
			...assignment,
			branchIds: [...assignment.branchIds],
		})),
		contactNumber: record.contactNumber,
		email: record.email,
		name: record.name,
		status: record.status,
		subscriberId: record.subscriberId,
	};
}

export function createMasterTenantAccessListRecords({
	branches,
	companies,
	entity,
	subscribers,
	users,
}: {
	branches: MasterBranchRecord[];
	companies: MasterCompanyRecord[];
	entity: MasterTenantAccessEntity;
	subscribers: MasterSubscriberRecord[];
	users: MasterUserRecord[];
}): MasterTenantAccessListRecord[] {
	switch (entity) {
		case "subscriber":
			return subscribers.map((subscriber) =>
				createSubscriberListRecord(subscriber, companies, branches, users),
			);
		case "company":
			return companies.map((company) =>
				createCompanyListRecord(company, subscribers, branches, users),
			);
		case "branch":
			return branches.map((branch) =>
				createBranchListRecord(branch, companies, subscribers),
			);
		case "user":
			return users.map((user) =>
				createUserListRecord(user, subscribers, branches),
			);
	}
}

export function createMasterTenantAccessMetrics({
	branches,
	companies,
	entity,
	subscribers,
	users,
}: {
	branches: MasterBranchRecord[];
	companies: MasterCompanyRecord[];
	entity: MasterTenantAccessEntity;
	subscribers: MasterSubscriberRecord[];
	users: MasterUserRecord[];
}): MasterTenantAccessMetric[] {
	const activeSubscribers = subscribers.filter(
		(subscriber) => subscriber.status === "Active" || subscriber.status === "Trial",
	).length;
	const activeCompanies = companies.filter(
		(company) => company.status === "Active" || company.status === "Trial",
	).length;
	const activeBranches = branches.filter(
		(branch) => branch.status === "Active" || branch.status === "Trial",
	).length;
	const activeUsers = users.filter(
		(user) => user.status === "Active" || user.status === "Trial",
	).length;
	const riskCount = subscribers.filter(
		(subscriber) =>
			subscriber.status === "Past Due" || subscriber.status === "Suspended",
	).length;

	switch (entity) {
		case "subscriber":
			return [
				{ helper: `${activeSubscribers} active or trial`, label: "Subscribers", value: subscribers.length },
				{ helper: "Created by subscriber or Master", label: "Companies", value: companies.length },
				{ helper: "Across all companies", label: "Users", value: users.length },
				{ helper: "Past due or suspended", label: "Needs Review", value: riskCount },
			];
		case "company":
			return [
				{ helper: `${activeCompanies} active or trial`, label: "Companies", value: companies.length },
				{ helper: "Subscriber owners", label: "Subscribers", value: subscribers.length },
				{ helper: "Operating units", label: "Branches", value: branches.length },
				{ helper: "Company assignments", label: "Users", value: users.length },
			];
		case "branch":
			return [
				{ helper: `${activeBranches} active or trial`, label: "Branches", value: branches.length },
				{ helper: "Main legal units", label: "Head Offices", value: branches.filter((branch) => branch.isMain).length },
				{ helper: "Linked operating units", label: "Satellites", value: branches.filter((branch) => branch.branchType === "Satellite").length },
				{ helper: "Branch access users", label: "Users", value: activeUsers },
			];
		case "user":
			return [
				{ helper: `${activeUsers} active or trial`, label: "Users", value: users.length },
				{ helper: "Company assignments", label: "Assigned Companies", value: users.reduce((total, user) => total + user.assignments.length, 0) },
				{ helper: "Branch selections", label: "Assigned Branches", value: users.reduce((total, user) => total + countAssignedBranches(user.assignments), 0) },
				{ helper: "Tenant owners", label: "Owners", value: users.filter((user) => user.assignments.some((assignment) => assignment.role === "Owner")).length },
			];
	}
}

export function formatMasterTenantAccessDate(value: string) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function getMasterTenantAccessSubscriberName(
	subscriberId: string,
	subscribers: MasterSubscriberRecord[],
) {
	return (
		subscribers.find((subscriber) => subscriber.id === subscriberId)?.name ??
		"Unknown subscriber"
	);
}

export function getMasterTenantAccessCompanyName(
	companyId: string,
	companies: MasterCompanyRecord[],
) {
	return (
		companies.find((company) => company.id === companyId)?.legalName ??
		"Unknown company"
	);
}

export function getMasterTenantAccessSubscriberForCompany(
	companyId: string,
	companies: MasterCompanyRecord[],
	subscribers: MasterSubscriberRecord[],
) {
	const company = companies.find((currentCompany) => currentCompany.id === companyId);

	if (!company) {
		return undefined;
	}

	return subscribers.find((subscriber) => subscriber.id === company.subscriberId);
}

export function createMasterTenantAccessRecordId(prefix: string, name: string) {
	const slug = name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 32);

	return `${prefix}-${slug || Date.now()}`;
}

function createSubscriberListRecord(
	subscriber: MasterSubscriberRecord,
	companies: MasterCompanyRecord[],
	branches: MasterBranchRecord[],
	users: MasterUserRecord[],
): MasterTenantAccessListRecord {
	const subscriberCompanies = companies.filter(
		(company) => company.subscriberId === subscriber.id,
	);
	const subscriberCompanyIds = new Set(
		subscriberCompanies.map((company) => company.id),
	);
	const subscriberBranches = branches.filter((branch) =>
		subscriberCompanyIds.has(branch.companyId),
	);
	const subscriberUsers = users.filter((user) => user.subscriberId === subscriber.id);
	const primaryCompany =
		companies.find((company) => company.id === subscriber.primaryCompanyId) ??
		subscriberCompanies[0];

	return {
		countA: subscriberCompanies.length,
		countB: subscriberUsers.length,
		dateText: formatMasterTenantAccessDate(subscriber.nextRenewalDate),
		detailText: subscriber.billingStatus,
		entity: "subscriber",
		id: subscriber.id,
		primaryText: subscriber.name,
		record: subscriber,
		relationName: primaryCompany?.legalName ?? "No company",
		relationText: `${subscriberBranches.length} branches`,
		secondaryText: subscriber.ownerEmail,
		status: subscriber.status,
	};
}

function createCompanyListRecord(
	company: MasterCompanyRecord,
	subscribers: MasterSubscriberRecord[],
	branches: MasterBranchRecord[],
	users: MasterUserRecord[],
): MasterTenantAccessListRecord {
	const companyBranches = branches.filter(
		(branch) => branch.companyId === company.id,
	);
	const companyUsers = users.filter((user) =>
		user.assignments.some((assignment) => assignment.companyId === company.id),
	);

	return {
		countA: companyBranches.length,
		countB: companyUsers.length,
		dateText: formatMasterTenantAccessDate(company.createdAt),
		detailText: company.planName,
		entity: "company",
		id: company.id,
		primaryText: company.legalName,
		record: company,
		relationName: getMasterTenantAccessSubscriberName(
			company.subscriberId,
			subscribers,
		),
		relationText: company.tradeName,
		secondaryText: company.email,
		status: company.status,
	};
}

function createBranchListRecord(
	branch: MasterBranchRecord,
	companies: MasterCompanyRecord[],
	subscribers: MasterSubscriberRecord[],
): MasterTenantAccessListRecord {
	const company = companies.find((currentCompany) => currentCompany.id === branch.companyId);

	return {
		countA: branch.isMain ? "Main" : "Unit",
		countB: branch.branchType,
		dateText: branch.tin,
		detailText: `${branch.branchType} / ${branch.tin}`,
		entity: "branch",
		id: branch.id,
		primaryText: branch.name,
		record: branch,
		relationName: company?.legalName ?? "Unknown company",
		relationText: company
			? getMasterTenantAccessSubscriberName(company.subscriberId, subscribers)
			: "Unknown subscriber",
		secondaryText: branch.email,
		status: branch.status,
	};
}

function createUserListRecord(
	user: MasterUserRecord,
	subscribers: MasterSubscriberRecord[],
	branches: MasterBranchRecord[],
): MasterTenantAccessListRecord {
	const primaryAssignment = user.assignments[0];

	return {
		countA: user.assignments.length,
		countB: countAssignedBranches(user.assignments),
		dateText: formatMasterTenantAccessDate(user.lastLogin),
		detailText: primaryAssignment?.role ?? "No role",
		entity: "user",
		id: user.id,
		primaryText: user.name,
		record: user,
		relationName: getMasterTenantAccessSubscriberName(
			user.subscriberId,
			subscribers,
		),
		relationText: `${branches.length} available branches`,
		secondaryText: user.email,
		status: user.status,
	};
}

function createBranch(
	id: string,
	companyId: string,
	code: string,
	name: string,
	branchType: MasterTenantAccessBranchType,
	isMain: boolean,
	tin: string,
): MasterBranchRecord {
	return {
		address: `${name}, Philippines`,
		branchType,
		code,
		companyId,
		contactNumber: "+63 2 8888 0000",
		email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.test`,
		id,
		isMain,
		linkedMainBranchId: "",
		name,
		status: "Active",
		tin,
	};
}

function countAssignedBranches(assignments: MasterTenantAccessUserAssignment[]) {
	return assignments.reduce(
		(total, assignment) => total + assignment.branchIds.length,
		0,
	);
}
