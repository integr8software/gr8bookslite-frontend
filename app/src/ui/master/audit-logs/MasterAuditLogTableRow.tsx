import {
	formatMasterAuditLogCreatedAt,
} from "@/app/src/data/master/audit-logs/MasterAuditLogData";
import type {
	MasterAuditLogAction,
	MasterAuditLogRecord,
	MasterAuditLogResult,
} from "@/app/src/types/master/audit-logs/MasterAuditLogTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterAuditLogTableRowProps = {
	record: MasterAuditLogRecord;
};

export function MasterAuditLogTableRow({
	record,
}: MasterAuditLogTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.companyName}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.companyId}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.branchName}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">{record.module}</p>
				<p className="mt-1 font-mono text-xs font-semibold text-darknavy/42">
					{record.recordId}
				</p>
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
				<p className="mt-1 text-xs text-darknavy/42">IP {record.ipAddress}</p>
			</td>
			<td className="px-4 py-4">
				<span className={getActionClassName(record.action)}>
					{record.action}
				</span>
			</td>
			<td className="px-4 py-4">
				<span className={getResultClassName(record.result)}>
					{record.result}
				</span>
			</td>
			<td className="px-4 py-4 text-xs font-semibold text-darknavy/58">
				{formatMasterAuditLogCreatedAt(record.createdAt)}
			</td>
		</tr>
	);
}

function getResultClassName(result: MasterAuditLogResult) {
	return joinClasses(
		"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
		result === "Error"
			? "bg-coralpink/12 text-coralpink"
			: "bg-citron/35 text-darknavy",
	);
}

function getActionClassName(action: MasterAuditLogAction) {
	return joinClasses(
		"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
		action === "Delete" ||
			action === "Suspend" ||
			action === "Cancel" ||
			action === "Disapproved"
			? "bg-coralpink/12 text-coralpink"
			: action === "Approve" ||
					action === "Create" ||
					action === "Restore" ||
					action === "Uncancel"
				? "bg-citron/35 text-darknavy"
				: "bg-skyblue/12 text-darknavy",
	);
}
