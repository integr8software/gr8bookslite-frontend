import type {
	AuditTrailAction,
	AuditTrailSeverity,
	AuditTrailTableColumnKey,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

export const AuditTrailHref = "/system-administration/audit-trail";

export const AuditTrailPaginationStorageKey =
	"system-administration.audit-trail";

export const AuditTrailActionOptions = [
	"Approve",
	"Create",
	"Delete",
	"Generate",
	"Reject",
	"Update",
	"View",
] as const satisfies readonly AuditTrailAction[];

export const AuditTrailSeverityOptions = [
	"Info",
	"Warning",
	"Critical",
] as const satisfies readonly AuditTrailSeverity[];

export const AuditTrailTableColumns: Array<{
	key: AuditTrailTableColumnKey;
	label: string;
	className: string;
}> = [
	{ key: "moduleLabel", label: "Module", className: "w-[19rem]" },
	{ key: "action", label: "Action", className: "w-[10rem]" },
	{ key: "actorName", label: "User", className: "w-[14rem]" },
	{ key: "recordId", label: "Record", className: "w-[10rem]" },
	{ key: "description", label: "Activity", className: "w-[30rem]" },
	{ key: "severity", label: "Severity", className: "w-[10rem]" },
	{ key: "createdAt", label: "Date", className: "w-[13rem]" },
];
