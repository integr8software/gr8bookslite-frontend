export type AuditTrailAction =
	| "Approve"
	| "Cancel"
	| "Delete"
	| "Edit"
	| "Export"
	| "Disapproved"
	| "Uncancel"
	| "Save"
	| "View";

export type AuditTrailDateRange = "all" | "24h" | "7d" | "30d";

export type AuditTrailModuleOption = {
	key: string;
	label: string;
};

export type AuditTrailRecord = {
	id: string;
	action: AuditTrailAction;
	actorName: string;
	actorRole: string;
	branchId: string;
	branchName: string;
	createdAt: string;
	description: string;
	entityId: string | null;
	entityType: string;
	ipAddress: string;
	moduleKey: string;
	module: string;
};

export type AuditTrailTableColumnKey =
	| "createdAt"
	| "actorName"
	| "action"
	| "description"
	| "module";
