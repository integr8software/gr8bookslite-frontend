import {
	formatAuditTrailCreatedAt,
	formatAuditTrailModuleTrail,
	getAuditTrailActionTone,
	getAuditTrailSeverityClassName,
} from "@/app/src/services/modules/system-administration/audit-trail/AuditTrailFormatters";
import type { AuditTrailRecord } from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

type AuditTrailTableRowProps = {
	record: AuditTrailRecord;
};

export function AuditTrailTableRow({ record }: AuditTrailTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4">
				<div className="font-semibold text-darknavy">{record.moduleLabel}</div>
				<div className="text-xs text-darknavy/50">
					{formatAuditTrailModuleTrail(record)}
				</div>
			</td>
			<td className="px-4 py-4">
				<span className={getActionClassName(record.action)}>
					{record.action}
				</span>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm font-semibold text-darknavy">
					{record.actorName}
				</div>
				<div className="text-xs text-darknavy/50">{record.actorRole}</div>
			</td>
			<td className="px-4 py-4 font-mono text-xs font-semibold text-darknavy/70">
				{record.recordId}
			</td>
			<td className="px-4 py-4">
				<div className="text-sm text-darknavy/75">{record.description}</div>
				<div className="mt-1 text-xs text-darknavy/45">
					IP {record.ipAddress}
				</div>
			</td>
			<td className="px-4 py-4">
				<span
					className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAuditTrailSeverityClassName(record.severity)}`}
				>
					{record.severity}
				</span>
			</td>
			<td className="px-4 py-4 text-xs font-medium text-darknavy/65">
				{formatAuditTrailCreatedAt(record.createdAt)}
			</td>
		</tr>
	);
}

function getActionClassName(action: AuditTrailRecord["action"]) {
	const tone = getAuditTrailActionTone(action);

	if (tone === "danger") {
		return "inline-flex rounded-full bg-coralpink/12 px-3 py-1 text-xs font-semibold text-coralpink";
	}

	if (tone === "success") {
		return "inline-flex rounded-full bg-citron/35 px-3 py-1 text-xs font-semibold text-darknavy";
	}

	return "inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy";
}
