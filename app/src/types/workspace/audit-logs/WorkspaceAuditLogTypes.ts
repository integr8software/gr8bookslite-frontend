export type WorkspaceAuditLogDateRange = "all" | "24h" | "7d" | "30d";

export type WorkspaceAuditLogAction =
	| "Approve"
	| "Create"
	| "Delete"
	| "Export"
	| "Login"
	| "Logout"
	| "Reject"
	| "Update"
	| "View";

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
};

export type WorkspaceAuditLogTableColumnKey =
	| "createdAt"
	| "actorName"
	| "action"
	| "description"
	| "module"
	| "branchName";

export type WorkspaceAuditLogFilters = {
	action: WorkspaceAuditLogAction | "all";
	branchId: string;
	dateRange: WorkspaceAuditLogDateRange;
	module: string;
	query: string;
};
