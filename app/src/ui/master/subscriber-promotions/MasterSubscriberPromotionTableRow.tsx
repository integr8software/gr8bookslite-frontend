import {
	formatMasterSubscriberPromotionDate,
	formatMasterSubscriberPromotionExpiry,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import type { MasterSubscriberPromotionRecord } from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import {
	MasterSubscriberPromotionModeBadge,
	MasterSubscriberPromotionStatusBadge,
} from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionBadges";

type MasterSubscriberPromotionTableRowProps = {
	record: MasterSubscriberPromotionRecord;
};

export function MasterSubscriberPromotionTableRow({
	record,
}: MasterSubscriberPromotionTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{record.subscriberName}
					</p>
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{record.ownerName}
					</p>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
						{record.planName}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<p className="line-clamp-2 text-sm font-semibold text-darknavy">
					{record.promotionName}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.promotionCode}
				</p>
				{record.invoiceNo ? (
					<p className="mt-1 text-xs font-medium text-darknavy/45">
						Used on {record.invoiceNo}
					</p>
				) : null}
			</td>
			<td className="px-4 py-4">
				<MasterSubscriberPromotionStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4">
				<MasterSubscriberPromotionModeBadge mode={record.assignmentMode} />
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterSubscriberPromotionDate(record.assignedAt)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{record.grantedBy}
				</p>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatMasterSubscriberPromotionDate(record.usedAt)}
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatMasterSubscriberPromotionExpiry(record.expiresAt)}
			</td>
		</tr>
	);
}
