import {
	formatAuditTrailCreatedAt,
	getAuditTrailActionTone,
} from "@/app/src/services/modules/system-administration/audit-trail/AuditTrailFormatters";
import type { AuditTrailRecord } from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

type AuditTrailTableRowProps = {
	record: AuditTrailRecord;
};

export function AuditTrailTableRow({ record }: AuditTrailTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 text-xs font-semibold text-darknavy/58">
				{formatAuditTrailCreatedAt(record.createdAt)}
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.actorName}
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
				<p className="line-clamp-2 text-sm leading-5 text-darknavy/72">
					{record.description}
				</p>
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
