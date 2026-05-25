import Link from "next/link";
import {
	getMasterPromotionTargetLabel,
	getMasterPromotionViewHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	formatMasterPromotionDate,
	formatMasterPromotionValue,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { MasterPromotionStatusBadge } from "@/app/src/ui/master/promotions/MasterPromotionBadges";
import { MasterPromotionRecordActions } from "@/app/src/ui/master/promotions/MasterPromotionRecordActions";

type MasterPromotionTableRowProps = {
	record: MasterPromotionRecord;
	onToggleStatus: (recordId: string) => void;
};

export function MasterPromotionTableRow({
	record,
	onToggleStatus,
}: MasterPromotionTableRowProps) {
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
			<td className="px-4 py-4 text-sm font-medium text-darknavy/65">
				{getMasterPromotionTargetLabel(record.target)}
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPromotionValue(record)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					Expires {formatMasterPromotionDate(record.expiresAt)}
				</p>
			</td>
			<td className="px-4 py-4">
				<MasterPromotionStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{record.redemptions}
			</td>
			<td className="px-4 py-4">
				<MasterPromotionRecordActions
					record={record}
					onToggleStatus={onToggleStatus}
				/>
			</td>
		</tr>
	);
}
