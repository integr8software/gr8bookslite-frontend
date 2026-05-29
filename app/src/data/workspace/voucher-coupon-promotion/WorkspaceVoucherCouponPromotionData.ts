import {
	formatMasterPromotionDate,
	formatMasterPromotionValue,
	getMasterPromotionById,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	MasterSubscriberPromotionRecords,
	formatMasterSubscriberPromotionDate,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type { MasterSubscriberPromotionRecord } from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import type { WorkspaceVoucherCouponPromotionRecord } from "@/app/src/types/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTypes";

export const WorkspaceVoucherCouponPromotionRecords =
	MasterSubscriberPromotionRecords.map(createWorkspaceVoucherCouponPromotionRecord);

export function formatWorkspaceVoucherCouponPromotionDate(value: string | null) {
	return formatMasterSubscriberPromotionDate(value);
}

export function formatWorkspaceVoucherCouponPromotionExpiry(
	value: string | null,
) {
	return formatMasterPromotionDate(value);
}

export function formatWorkspaceVoucherCouponPromotionValue(
	record: Pick<
		WorkspaceVoucherCouponPromotionRecord,
		"discountKind" | "value"
	>,
) {
	return formatMasterPromotionValue(record);
}

export function getWorkspaceVoucherCouponPromotionSummary(
	records: WorkspaceVoucherCouponPromotionRecord[],
) {
	const subscriberCount = new Set(records.map((record) => record.subscriberId))
		.size;

	return {
		availableRecords: records.filter((record) => record.status === "Available")
			.length,
		canApplyRecords: records.filter((record) => record.canApply).length,
		subscriberCount,
		totalRecords: records.length,
		usedRecords: records.filter((record) => record.status === "Used").length,
	};
}

function createWorkspaceVoucherCouponPromotionRecord(
	record: MasterSubscriberPromotionRecord,
): WorkspaceVoucherCouponPromotionRecord {
	const promotion = getMasterPromotionById(record.promotionId);

	return {
		assignedAt: record.assignedAt,
		assignmentId: record.id,
		assignmentMode: record.assignmentMode,
		canApply: promotion
			? isWorkspaceVoucherCouponPromotionApplicable(record, promotion)
			: false,
		code: record.promotionCode,
		description: promotion?.description ?? record.notes,
		discountKind: promotion?.discountKind ?? "Fixed",
		expiresAt: record.expiresAt,
		grantedBy: record.grantedBy,
		invoiceNo: record.invoiceNo,
		masterStatus: promotion?.status ?? "Inactive",
		notes: record.notes,
		ownerName: record.ownerName,
		planName: record.planName,
		promotionId: record.promotionId,
		promotionName: record.promotionName,
		status: record.status,
		subscriberId: record.subscriberId,
		subscriberName: record.subscriberName,
		type: promotion?.type ?? "Promo Code",
		usedAt: record.usedAt,
		value: promotion?.value ?? 0,
	};
}

function isWorkspaceVoucherCouponPromotionApplicable(
	record: MasterSubscriberPromotionRecord,
	promotion: MasterPromotionRecord,
) {
	if (record.status !== "Available" || promotion.status !== "Active") {
		return false;
	}

	if (!record.expiresAt) {
		return true;
	}

	const expiryDate = new Date(`${record.expiresAt}T23:59:59`);

	return expiryDate >= new Date();
}

