import { MainLayoutMockData } from "@/app/src/data/shared/main-layout/MainLayoutMockData";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogFilters,
	WorkspaceAuditLogRecord,
	WorkspaceAuditLogSeverity,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

const BaseTimestamp = Date.UTC(2026, 5, 1, 7, 45, 0);
const QueryResultLimit = 500;

const Branches = MainLayoutMockData.branches.map((branch) => ({
	id: branch.id,
	name: branch.name,
}));

const Modules = [
	"Company Settings",
	"Branch Management",
	"User Management",
	"Billing Subscription",
	"Voucher Configuration",
	"Approval Setup",
	"Security Settings",
] as const;

const Actions = [
	"View",
	"Create",
	"Update",
	"Approve",
	"Export",
	"Reject",
	"Delete",
] as const satisfies readonly WorkspaceAuditLogAction[];

const Severities = [
	"Info",
	"Info",
	"Info",
	"Warning",
	"Critical",
] as const satisfies readonly WorkspaceAuditLogSeverity[];

const Actors = [
	{ name: "John Dela Cruz", role: "Workspace Admin" },
	{ name: "Mia Santos", role: "Approver" },
	{ name: "Paolo Garcia", role: "Accountant" },
	{ name: "System", role: "Automation" },
] as const;

export const WorkspaceAuditLogRecords: WorkspaceAuditLogRecord[] = Array.from(
	{ length: 96 },
	(_, index) => {
		const branch = Branches[index % Branches.length] ?? {
			id: "workspace",
			name: MainLayoutMockData.currentCompany.name,
		};
		const action = Actions[index % Actions.length];
		const actor = Actors[index % Actors.length];
		const moduleName = Modules[index % Modules.length];
		const severity = Severities[index % Severities.length];
		const recordId = `${moduleName
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "-")
			.slice(0, 12)}-${String(index + 1).padStart(5, "0")}`;

		return {
			id: `workspace-audit-${index + 1}`,
			action,
			actorName: actor.name,
			actorRole: actor.role,
			branchId: branch.id,
			branchName: branch.name,
			createdAt: new Date(
				BaseTimestamp - index * 23 * 60 * 1000,
			).toISOString(),
			description: createWorkspaceAuditDescription(action, moduleName, recordId),
			ipAddress: `10.1.${index % 16}.${18 + (index % 90)}`,
			module: moduleName,
			recordId,
			severity,
		};
	},
);

export function queryWorkspaceAuditLogRecords(
	filters: WorkspaceAuditLogFilters,
	records = WorkspaceAuditLogRecords,
) {
	const filteredRecords = records.filter((record) =>
		matchesWorkspaceAuditFilters(record, filters),
	);

	return {
		records: filteredRecords.slice(0, QueryResultLimit),
		totalMatched: filteredRecords.length,
	};
}

export function formatWorkspaceAuditLogCreatedAt(createdAt: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(createdAt));
}

export function getWorkspaceAuditLogBranchOptions() {
	return Branches;
}

export function getWorkspaceAuditLogModuleOptions(
	records = WorkspaceAuditLogRecords,
) {
	return Array.from(new Set(records.map((record) => record.module))).sort();
}

function matchesWorkspaceAuditFilters(
	record: WorkspaceAuditLogRecord,
	filters: WorkspaceAuditLogFilters,
) {
	if (filters.branchId !== "all" && record.branchId !== filters.branchId) {
		return false;
	}

	if (filters.module !== "all" && record.module !== filters.module) {
		return false;
	}

	if (filters.action !== "all" && record.action !== filters.action) {
		return false;
	}

	if (filters.severity !== "all" && record.severity !== filters.severity) {
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
		record.actorName,
		record.actorRole,
		record.branchName,
		record.description,
		record.ipAddress,
		record.module,
		record.recordId,
		record.severity,
	]
		.join(" ")
		.toLowerCase()
		.includes(normalizedQuery);
}

function isWithinDateRange(
	createdAt: string,
	dateRange: WorkspaceAuditLogDateRange,
) {
	if (dateRange === "all") {
		return true;
	}

	const rangeHours: Record<Exclude<WorkspaceAuditLogDateRange, "all">, number> =
		{
			"24h": 24,
			"7d": 24 * 7,
			"30d": 24 * 30,
		};
	const minimumTimestamp =
		BaseTimestamp - rangeHours[dateRange] * 60 * 60 * 1000;

	return new Date(createdAt).getTime() >= minimumTimestamp;
}

function createWorkspaceAuditDescription(
	action: WorkspaceAuditLogAction,
	module: string,
	recordId: string,
) {
	const pastTense: Record<WorkspaceAuditLogAction, string> = {
		Approve: "approved",
		Create: "created",
		Delete: "deleted",
		Export: "exported",
		Reject: "rejected",
		Update: "updated",
		View: "viewed",
	};

	return `${module} record ${recordId} was ${pastTense[action]}.`;
}
