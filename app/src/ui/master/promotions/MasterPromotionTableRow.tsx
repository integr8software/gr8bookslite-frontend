import Link from "next/link";
import {
	getMasterPromotionTargetLabels,
	getMasterPromotionTargetSummary,
	getMasterPromotionViewHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	formatMasterPromotionDate,
	formatMasterPromotionLimit,
	formatMasterPromotionStartDate,
	formatMasterPromotionUsage,
	formatMasterPromotionValue,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { MasterPromotionStatusBadge } from "@/app/src/ui/master/promotions/MasterPromotionBadges";
import { MasterPromotionRecordActions } from "@/app/src/ui/master/promotions/MasterPromotionRecordActions";

type MasterPromotionTableRowProps = {
	record: MasterPromotionRecord;
	onDeleteRecord: (record: MasterPromotionRecord) => void;
};

export function MasterPromotionTableRow({
	onDeleteRecord,
	record,
}: MasterPromotionTableRowProps) {
	const targetLabels = getMasterPromotionTargetLabels(record.targetPlanIds);

	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<Link
						href={getMasterPromotionViewHref(record.id)}
						className="block truncate text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						{record.name}
					</Link>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/42">
						{record.type} - {record.code}
					</p>
					<p className="mt-1 line-clamp-2 text-sm leading-5 text-darknavy/52">
						{record.description}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{record.billingCycle}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.type}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="line-clamp-2 text-sm font-semibold text-darknavy">
					{getMasterPromotionTargetSummary(record.targetPlanIds)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{targetLabels.length === 1
						? "1 target"
						: `${targetLabels.length} targets`}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPromotionStartDate(record.startsAt)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.expiresAt
						? `Expires ${formatMasterPromotionDate(record.expiresAt)}`
						: "No expiration"}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPromotionValue(record)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.discountKind}
				</p>
			</td>
			<td className="px-4 py-4">
				<MasterPromotionStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPromotionUsage(record)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{formatMasterPromotionLimit(record)}
				</p>
			</td>
			<td className="px-4 py-4">
				<MasterPromotionRecordActions
					record={record}
					onDeleteRecord={onDeleteRecord}
				/>
			</td>
		</tr>
	);
}
