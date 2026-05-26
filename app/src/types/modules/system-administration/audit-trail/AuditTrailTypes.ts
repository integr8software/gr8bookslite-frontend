export type AuditTrailAction =
	| "Approve"
	| "Create"
	| "Delete"
	| "Generate"
	| "Reject"
	| "Update"
	| "View";

export type AuditTrailSeverity = "Info" | "Warning" | "Critical";

export type AuditTrailModuleOption = {
	href: string;
	key: string;
	label: string;
	section: string;
	trail: string[];
};

export type AuditTrailRecord = {
	id: string;
	action: AuditTrailAction;
	actorName: string;
	actorRole: string;
	createdAt: string;
	description: string;
	ipAddress: string;
	moduleHref: string;
	moduleKey: string;
	moduleLabel: string;
	recordId: string;
	section: string;
	severity: AuditTrailSeverity;
	trail: string[];
};

export type AuditTrailTableColumnKey =
	| "moduleLabel"
	| "action"
	| "actorName"
	| "recordId"
	| "description"
	| "severity"
	| "createdAt";
