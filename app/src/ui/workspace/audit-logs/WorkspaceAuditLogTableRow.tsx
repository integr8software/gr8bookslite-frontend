import {
	formatWorkspaceAuditLogCreatedAt,
} from "@/app/src/data/workspace/audit-logs/WorkspaceAuditLogData";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogRecord,
	WorkspaceAuditLogSeverity,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WorkspaceAuditLogTableRowProps = {
	record: WorkspaceAuditLogRecord;
};

export function WorkspaceAuditLogTableRow({
	record,
}: WorkspaceAuditLogTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.branchName}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">{record.module}</p>
			</td>
			<td className="px-4 py-4">
				<span className={getActionClassName(record.action)}>
					{record.action}
				</span>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.actorName}
				</p>
				<p className="mt-1 text-xs text-darknavy/48">{record.actorRole}</p>
			</td>
			<td className="px-4 py-4">
				<p className="line-clamp-2 text-sm leading-5 text-darknavy/72">
					{record.description}
				</p>
			</td>
			<td className="px-4 py-4">
				<span className={getSeverityClassName(record.severity)}>
					{record.severity}
				</span>
			</td>
			<td className="px-4 py-4 text-xs font-semibold text-darknavy/58">
				{formatWorkspaceAuditLogCreatedAt(record.createdAt)}
			</td>
		</tr>
	);
}

function getActionClassName(action: WorkspaceAuditLogAction) {
	return joinClasses(
		"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
		action === "Delete" || action === "Reject"
			? "bg-coralpink/12 text-coralpink"
			: action === "Approve" || action === "Create"
				? "bg-citron/35 text-darknavy"
				: "bg-skyblue/12 text-darknavy",
	);
}

function getSeverityClassName(severity: WorkspaceAuditLogSeverity) {
	return joinClasses(
		"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
		severity === "Critical"
			? "bg-coralpink/12 text-coralpink"
			: severity === "Warning"
				? "bg-citron/35 text-darknavy"
				: "bg-skyblue/12 text-darknavy",
	);
}
