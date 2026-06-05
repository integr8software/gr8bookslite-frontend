import {
	MasterAuditLogActionOptions,
	MasterAuditLogModuleOptions,
	MasterAuditLogQueryResultLimit,
} from "@/app/src/constants/master/audit-logs/MasterAuditLogConstants";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import type {
	MasterAuditLogAction,
	MasterAuditLogDateRange,
	MasterAuditLogFilters,
	MasterAuditLogRecord,
	MasterAuditLogResult,
} from "@/app/src/types/master/audit-logs/MasterAuditLogTypes";

type MasterAuditLogCompany = {
	id: string;
	name: string;
	plan: string;
	branches: string[];
};

type QueryResult<TRecord> = {
	records: TRecord[];
	totalMatched: number;
};

const BaseTimestamp = Date.UTC(2026, 5, 1, 8, 15, 0);

export const MasterAuditLogCompanies: MasterAuditLogCompany[] = [
	{
		id: "cmp-gr8",
		name: AppName,
		plan: "Full Suite",
		branches: ["Head Office", "North Branch", "South Satellite"],
	},
	{
		id: "cmp-trading",
		name: "Demo Trading Corp.",
		plan: "Inventory Operations",
		branches: ["Main Warehouse", "Cebu Depot"],
	},
	{
		id: "cmp-med",
		name: "Northstar Medical Group",
		plan: "Accounting Essentials",
		branches: ["Makati Clinic", "Davao Clinic"],
	},
	{
		id: "cmp-food",
		name: "Harbor Food Services",
		plan: "Transaction Lite",
		branches: ["Central Kitchen", "Distribution Hub"],
	},
	{
		id: "cmp-school",
		name: "Metro Learning Institute",
		plan: "Launch Upgrade",
		branches: ["Main Campus", "Annex Campus"],
	},
];

const AuditResults = [
	"Success",
	"Success",
	"Success",
	"Success",
	"Error",
] as const satisfies readonly MasterAuditLogResult[];

const Actors = [
	{
		email: "ana.reyes@example.test",
		name: "Ana Reyes",
		role: "Workspace Admin",
	},
	{
		email: "marco.santos@example.test",
		name: "Marco Santos",
		role: "Company Admin",
	},
	{
		email: "lina.cruz@example.test",
		name: "Lina Cruz",
		role: "Billing Admin",
	},
	{
		email: "system@gr8books.test",
		name: "System",
		role: "Automation",
	},
] as const;

export const MasterAuditLogRecords: MasterAuditLogRecord[] = Array.from(
	{ length: 240 },
	(_, index) => {
		const company =
			MasterAuditLogCompanies[index % MasterAuditLogCompanies.length];
		const action =
			MasterAuditLogActionOptions[index % MasterAuditLogActionOptions.length];
		const actor = Actors[index % Actors.length];
		const moduleName =
			MasterAuditLogModuleOptions[index % MasterAuditLogModuleOptions.length];
		const result = AuditResults[index % AuditResults.length];
		const branchName = company.branches[index % company.branches.length];
		const recordId = `${company.id.toUpperCase()}-${moduleName
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "-")
			.slice(0, 10)}-${String(index + 1).padStart(5, "0")}`;

		return {
			id: `master-audit-${index + 1}`,
			action,
			actorEmail: actor.email,
			actorName: actor.name,
			actorRole: actor.role,
			branchName,
			companyId: company.id,
			companyName: company.name,
			createdAt: createCreatedAt(index, 31),
			description: createAuditDescription(
				action,
				moduleName,
				recordId,
				result,
			),
			ipAddress: `172.16.${index % 24}.${22 + (index % 90)}`,
			module: moduleName,
			recordId,
			result,
		};
	},
);

export function queryMasterAuditLogRecords(
	filters: MasterAuditLogFilters,
	records = MasterAuditLogRecords,
	limit = MasterAuditLogQueryResultLimit,
): QueryResult<MasterAuditLogRecord> {
	const filteredRecords = records.filter((record) =>
		matchesMasterAuditFilters(record, filters),
	);

	return {
		records: filteredRecords.slice(0, limit),
		totalMatched: filteredRecords.length,
	};
}

export function formatMasterAuditLogCreatedAt(createdAt: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(createdAt));
}

export function getUniqueMasterAuditModules(records = MasterAuditLogRecords) {
	const recordedModules = new Set(records.map((record) => record.module));

	return MasterAuditLogModuleOptions.filter((module) =>
		recordedModules.has(module),
	);
}

function matchesMasterAuditFilters(
	record: MasterAuditLogRecord,
	filters: MasterAuditLogFilters,
) {
	if (filters.companyId !== "all" && record.companyId !== filters.companyId) {
		return false;
	}

	if (filters.module !== "all" && record.module !== filters.module) {
		return false;
	}

	if (filters.action !== "all" && record.action !== filters.action) {
		return false;
	}

	if (filters.result !== "all" && record.result !== filters.result) {
		return false;
	}

	if (!isWithinDateRange(record.createdAt, filters.dateRange)) {
		return false;
	}

	if (!filters.query.trim()) {
		return true;
	}

	const normalizedQuery = filters.query.trim().toLowerCase();

	return [
		record.action,
		record.actorEmail,
		record.actorName,
		record.actorRole,
		record.branchName,
		record.companyName,
		record.description,
		record.ipAddress,
		record.module,
		record.recordId,
		record.result,
	]
		.join(" ")
		.toLowerCase()
		.includes(normalizedQuery);
}

function isWithinDateRange(
	createdAt: string,
	dateRange: MasterAuditLogDateRange,
) {
	if (dateRange === "all") {
		return true;
	}

	const rangeHours: Record<Exclude<MasterAuditLogDateRange, "all">, number> = {
		"24h": 24,
		"7d": 24 * 7,
		"30d": 24 * 30,
		"90d": 24 * 90,
	};
	const minimumTimestamp =
		BaseTimestamp - rangeHours[dateRange] * 60 * 60 * 1000;

	return new Date(createdAt).getTime() >= minimumTimestamp;
}

function createCreatedAt(index: number, minutesBetweenRecords: number) {
	return new Date(
		BaseTimestamp - index * minutesBetweenRecords * 60 * 1000,
	).toISOString();
}

function createAuditDescription(
	action: MasterAuditLogAction,
	module: string,
	recordId: string,
	result: MasterAuditLogResult,
) {
	const pastTense: Record<MasterAuditLogAction, string> = {
		Approve: "approved a pending change for",
		Cancel: "cancelled",
		Create: "created",
		Delete: "deleted",
		Disapproved: "disapproved a pending change for",
		Export: "exported data from",
		Import: "imported data into",
		Login: "signed in from a trusted device for",
		Restore: "restored",
		Suspend: "suspended access linked to",
		Uncancel: "uncancelled",
		Update: "updated",
	};
	const failedTense: Record<MasterAuditLogAction, string> = {
		Approve: "approve a pending change for",
		Cancel: "cancel",
		Create: "create",
		Delete: "delete",
		Disapproved: "disapprove a pending change for",
		Export: "export data from",
		Import: "import data into",
		Login: "sign in from a trusted device for",
		Restore: "restore",
		Suspend: "suspend access linked to",
		Uncancel: "uncancel",
		Update: "update",
	};

	if (result === "Error") {
		return `${module} failed to ${failedTense[action]} record ${recordId}.`;
	}

	return `${module} ${pastTense[action]} record ${recordId}.`;
}
