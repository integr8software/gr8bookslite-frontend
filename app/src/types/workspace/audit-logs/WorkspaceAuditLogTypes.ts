export type WorkspaceAuditLogDateRange = "all" | "24h" | "7d" | "30d";

export type WorkspaceAuditLogAction =
	| "Approve"
	| "Create"
	| "Delete"
	| "Export"
	| "Reject"
	| "Update"
	| "View";

export type WorkspaceAuditLogSeverity = "Info" | "Warning" | "Critical";

export type WorkspaceAuditLogRecord = {
	id: string;
	action: WorkspaceAuditLogAction;
	actorName: string;
	actorRole: string;
	branchId: string;
	branchName: string;
	createdAt: string;
	description: string;
	ipAddress: string;
	module: string;
	recordId: string;
	severity: WorkspaceAuditLogSeverity;
};

export type WorkspaceAuditLogTableColumnKey =
	| "branchName"
	| "module"
	| "action"
	| "actorName"
	| "description"
	| "severity"
	| "createdAt";

export type WorkspaceAuditLogFilters = {
	action: WorkspaceAuditLogAction | "all";
	branchId: string;
	dateRange: WorkspaceAuditLogDateRange;
	module: string;
	query: string;
	severity: WorkspaceAuditLogSeverity | "all";
};
