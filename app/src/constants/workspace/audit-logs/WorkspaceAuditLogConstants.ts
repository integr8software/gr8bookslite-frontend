import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogTableColumnKey,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

export const WorkspaceAuditLogsHref = "/workspace/audit-logs";
export const WorkspaceAuditLogPaginationStorageKey = "workspace.audit-logs";

export const WorkspaceAuditLogActionOptions = [
	"Approve",
	"Create",
	"Delete",
	"Export",
	"Login",
	"Logout",
	"Reject",
	"Update",
	"View",
] as const satisfies readonly WorkspaceAuditLogAction[];

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
	{ key: "createdAt", label: "Date", className: "w-[13rem]" },
	{ key: "actorName", label: "User", className: "w-[15rem]" },
	{ key: "action", label: "Action", className: "w-[10rem]" },
	{ key: "description", label: "Activity", className: "w-[34rem]" },
	{ key: "module", label: "Module", className: "w-[18rem]" },
];
