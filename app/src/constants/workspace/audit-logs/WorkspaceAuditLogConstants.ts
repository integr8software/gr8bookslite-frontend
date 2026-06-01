import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogSeverity,
	WorkspaceAuditLogTableColumnKey,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

export const WorkspaceAuditLogsHref = "/workspace/audit-logs";
export const WorkspaceAuditLogPaginationStorageKey = "workspace.audit-logs";

export const WorkspaceAuditLogActionOptions = [
	"Approve",
	"Create",
	"Delete",
	"Export",
	"Reject",
	"Update",
	"View",
] as const satisfies readonly WorkspaceAuditLogAction[];

export const WorkspaceAuditLogSeverityOptions = [
	"Info",
	"Warning",
	"Critical",
] as const satisfies readonly WorkspaceAuditLogSeverity[];

export const WorkspaceAuditLogDateRangeOptions = [
	{ label: "All dates", value: "all" },
	{ label: "Past 24 hours", value: "24h" },
	{ label: "Past 7 days", value: "7d" },
	{ label: "Past 30 days", value: "30d" },
] as const satisfies readonly {
	label: string;
	value: WorkspaceAuditLogDateRange;
}[];

export const WorkspaceAuditLogTableColumns: {
	key: WorkspaceAuditLogTableColumnKey;
	label: string;
	className: string;
}[] = [
	{ key: "branchName", label: "Branch", className: "w-[18rem]" },
	{ key: "module", label: "Module", className: "w-[18rem]" },
	{ key: "action", label: "Action", className: "w-[10rem]" },
	{ key: "actorName", label: "User", className: "w-[15rem]" },
	{ key: "description", label: "Activity", className: "w-[34rem]" },
	{ key: "severity", label: "Severity", className: "w-[10rem]" },
	{ key: "createdAt", label: "Date", className: "w-[13rem]" },
];
