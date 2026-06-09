import type {
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogFilters,
	WorkspaceAuditLogRecord,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

const QueryResultLimit = 500;
const EmptyWorkspaceAuditLogRecords: WorkspaceAuditLogRecord[] = [];

export function queryWorkspaceAuditLogRecords(
	filters: WorkspaceAuditLogFilters,
	records = EmptyWorkspaceAuditLogRecords,
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

export function getWorkspaceAuditLogBranchOptions(
	records = EmptyWorkspaceAuditLogRecords,
) {
	return Array.from(
		new Map(
			records.map((record) => [
				record.branchId,
				{ id: record.branchId, name: record.branchName },
			]),
		).values(),
	).sort((first, second) => first.name.localeCompare(second.name));
}

export function getWorkspaceAuditLogModuleOptions(
	records = EmptyWorkspaceAuditLogRecords,
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
		Date.now() - rangeHours[dateRange] * 60 * 60 * 1000;

	return new Date(createdAt).getTime() >= minimumTimestamp;
}

