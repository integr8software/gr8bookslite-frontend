import type {
	AuditTrailAction,
	AuditTrailDateRange,
	AuditTrailTableColumnKey,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

export const AuditTrailHref = "/system-administration/audit-trail";

export const AuditTrailPaginationStorageKey =
	"system-administration.audit-trail";

export const AuditTrailActionOptions = [
	"Approve",
	"Cancel",
	"Delete",
	"Edit",
	"Export",
	"Reject",
	"Save",
	"View",
] as const satisfies readonly AuditTrailAction[];

export const AuditTrailDateRangeOptions = [
	{ label: "All dates", value: "all" },
	{ label: "Past 24 hours", value: "24h" },
	{ label: "Past 7 days", value: "7d" },
	{ label: "Past 30 days", value: "30d" },
] as const satisfies readonly {
	label: string;
	value: AuditTrailDateRange;
}[];

export const AuditTrailTableColumns: Array<{
	key: AuditTrailTableColumnKey;
	label: string;
	className: string;
}> = [
	{ key: "createdAt", label: "Date", className: "w-[13rem]" },
	{ key: "actorName", label: "User", className: "w-[15rem]" },
	{ key: "module", label: "Module", className: "w-[18rem]" },
	{ key: "action", label: "Action", className: "w-[10rem]" },
	{ key: "description", label: "Activity", className: "w-[34rem]" },
];
