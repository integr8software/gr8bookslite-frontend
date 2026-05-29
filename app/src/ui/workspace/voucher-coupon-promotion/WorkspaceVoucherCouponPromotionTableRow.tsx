import {
	formatWorkspaceVoucherCouponPromotionDate,
	formatWorkspaceVoucherCouponPromotionExpiry,
	formatWorkspaceVoucherCouponPromotionValue,
} from "@/app/src/data/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionData";
import type { WorkspaceVoucherCouponPromotionRecord } from "@/app/src/types/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTypes";
import { MasterPromotionStatusBadge } from "@/app/src/ui/master/promotions/MasterPromotionBadges";
import { MasterSubscriberPromotionStatusBadge } from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionBadges";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WorkspaceVoucherCouponPromotionTableRowProps = {
	record: WorkspaceVoucherCouponPromotionRecord;
};

export function WorkspaceVoucherCouponPromotionTableRow({
	record,
}: WorkspaceVoucherCouponPromotionTableRowProps) {
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
					{record.code}
				</p>
				<p className="mt-1 text-xs font-medium text-darknavy/45">
					Assigned {formatWorkspaceVoucherCouponPromotionDate(record.assignedAt)}
				</p>
			</td>
			<td className="px-4 py-4">
				<span
					className={joinClasses(
						"inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
						getPromotionTypeClassName(record.type),
					)}
				>
					{record.type}
				</span>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatWorkspaceVoucherCouponPromotionValue(record)}
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-2">
					<MasterSubscriberPromotionStatusBadge status={record.status} />
					{record.invoiceNo ? (
						<p className="text-xs font-medium text-darknavy/45">
							{record.invoiceNo}
						</p>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="grid gap-2">
					<MasterPromotionStatusBadge status={record.masterStatus} />
					{record.canApply ? (
						<p className="text-xs font-semibold text-emerald-600">
							Ready for billing
						</p>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatWorkspaceVoucherCouponPromotionExpiry(record.expiresAt)}
			</td>
		</tr>
	);
}

function getPromotionTypeClassName(
	type: WorkspaceVoucherCouponPromotionRecord["type"],
) {
	switch (type) {
		case "Coupon":
			return "bg-skyblue/12 text-darknavy ring-skyblue/25";
		case "Voucher":
			return "bg-citron/35 text-darknavy ring-citron/50";
		case "Event Promo":
			return "bg-coralpink/12 text-coralpink ring-coralpink/20";
		case "Promo Code":
			return "bg-offwhite text-darknavy ring-darknavy/10";
	}
}

