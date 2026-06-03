export type MasterAuditLogDateRange =
	| "all"
	| "24h"
	| "7d"
	| "30d"
	| "90d";

export type MasterAuditLogAction =
	| "Approve"
	| "Cancel"
	| "Create"
	| "Delete"
	| "Disapproved"
	| "Export"
	| "Import"
	| "Login"
	| "Restore"
	| "Suspend"
	| "Uncancel"
	| "Update";

export type MasterAuditLogResult = "Success" | "Error";

export type MasterAuditLogRecord = {
	id: string;
	action: MasterAuditLogAction;
	actorEmail: string;
	actorName: string;
	actorRole: string;
	branchName: string;
	companyId: string;
	companyName: string;
	createdAt: string;
	description: string;
	ipAddress: string;
	module: string;
	recordId: string;
	result: MasterAuditLogResult;
};

export type MasterAuditLogTableColumnKey =
	| "companyName"
	| "branchName"
	| "module"
	| "actorName"
	| "description"
	| "action"
	| "result"
	| "createdAt";

export type MasterAuditLogFilters = {
	action: MasterAuditLogAction | "all";
	companyId: string;
	dateRange: MasterAuditLogDateRange;
	module: string;
	query: string;
	result: MasterAuditLogResult | "all";
};
