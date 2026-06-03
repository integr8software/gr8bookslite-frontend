import {
	formatMasterPromotionDate,
	formatMasterPromotionValue,
	getMasterPromotionById,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	MasterSubscriptionCompanies,
	getMasterSubscriptionCompanyById,
	getMasterSubscriptionPlanName,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import {
	MasterSubscriberPromotionRecords,
	formatMasterSubscriberPromotionDate,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import { WorkspaceCurrentBillingSubscriberId } from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type { MasterSubscriberPromotionRecord } from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import type {
	WorkspaceVouchersAndCouponsRecord,
	WorkspaceVouchersAndCouponsType,
} from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";

type WorkspaceVouchersAndCouponsPossessionSeed = {
	assignedAt: string;
	assignmentId: string;
	expiresAt: string | null;
	notes: string;
	promotionId: string;
};

const CurrentSubscriber =
	getMasterSubscriptionCompanyById(WorkspaceCurrentBillingSubscriberId) ??
	MasterSubscriptionCompanies[0];

const WorkspaceVouchersAndCouponsPossessionSeeds: WorkspaceVouchersAndCouponsPossessionSeed[] =
	[
		{
			assignedAt: "2026-05-18",
			assignmentId: "workspace-gr8books-coupon-accounting100",
			expiresAt: "2026-08-31",
			notes: "Subscriber-held coupon for renewal checkout.",
			promotionId: "coupon-accounting100",
		},
		{
			assignedAt: "2026-05-20",
			assignmentId: "workspace-gr8books-voucher-addon-credit",
			expiresAt: null,
			notes: "Subscriber-held voucher for add-on billing.",
			promotionId: "voucher-addon-credit",
		},
		{
			assignedAt: "2026-05-24",
			assignmentId: "workspace-gr8books-voucher-loyalty25",
			expiresAt: "2026-09-30",
			notes: "Subscriber-held percentage voucher for renewal billing.",
			promotionId: "voucher-loyalty25",
		},
	];

export const WorkspaceVouchersAndCouponsRecords =
	createWorkspaceVouchersAndCouponsRecords();

export function formatWorkspaceVouchersAndCouponsDate(value: string | null) {
	return formatMasterSubscriberPromotionDate(value);
}

export function formatWorkspaceVouchersAndCouponsExpiry(value: string | null) {
	return formatMasterPromotionDate(value);
}

export function formatWorkspaceVouchersAndCouponsValue(
	record: Pick<WorkspaceVouchersAndCouponsRecord, "discountKind" | "value">,
) {
	return formatMasterPromotionValue(record);
}

export function getWorkspaceVouchersAndCouponsSummary(
	records: WorkspaceVouchersAndCouponsRecord[],
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

function createWorkspaceVouchersAndCouponsRecords() {
	const masterRecords = MasterSubscriberPromotionRecords.filter(
		(record) =>
			record.subscriberId === WorkspaceCurrentBillingSubscriberId &&
			record.status === "Available",
	)
		.map(createRecordFromMasterAssignment)
		.filter(isWorkspaceVouchersAndCouponsRecord);
	const possessionRecords = WorkspaceVouchersAndCouponsPossessionSeeds.map(
		createRecordFromPossessionSeed,
	).filter(isWorkspaceVouchersAndCouponsRecord);
	const seenAssignmentIds = new Set<string>();

	return [...possessionRecords, ...masterRecords].filter((record) => {
		if (seenAssignmentIds.has(record.assignmentId)) {
			return false;
		}

		seenAssignmentIds.add(record.assignmentId);
		return true;
	});
}

function createRecordFromMasterAssignment(
	record: MasterSubscriberPromotionRecord,
): WorkspaceVouchersAndCouponsRecord | null {
	const promotion = getMasterPromotionById(record.promotionId);

	if (!promotion || !isVoucherOrCoupon(promotion.type)) {
		return null;
	}

	return {
		assignedAt: record.assignedAt,
		assignmentId: record.id,
		assignmentMode: record.assignmentMode,
		canApply: isWorkspaceVouchersAndCouponsApplicable(record, promotion),
		code: record.promotionCode,
		description: promotion.description,
		discountKind: promotion.discountKind,
		expiresAt: record.expiresAt,
		grantedBy: record.grantedBy,
		invoiceNo: record.invoiceNo,
		masterStatus: promotion.status,
		notes: record.notes,
		ownerName: record.ownerName,
		planName: record.planName,
		promotionId: record.promotionId,
		promotionName: record.promotionName,
		status: record.status,
		subscriberId: record.subscriberId,
		subscriberName: record.subscriberName,
		type: promotion.type,
		usedAt: record.usedAt,
		value: promotion.value,
	};
}

function createRecordFromPossessionSeed(
	seed: WorkspaceVouchersAndCouponsPossessionSeed,
): WorkspaceVouchersAndCouponsRecord | null {
	const promotion = getMasterPromotionById(seed.promotionId);

	if (!promotion || !isVoucherOrCoupon(promotion.type)) {
		return null;
	}

	return {
		assignedAt: seed.assignedAt,
		assignmentId: seed.assignmentId,
		assignmentMode: "Chosen subscriber",
		canApply: isPromotionCurrentlyUsable(promotion, seed.expiresAt),
		code: promotion.code,
		description: promotion.description,
		discountKind: promotion.discountKind,
		expiresAt: seed.expiresAt ?? promotion.expiresAt,
		grantedBy: "Billing Admin",
		invoiceNo: null,
		masterStatus: promotion.status,
		notes: seed.notes,
		ownerName: CurrentSubscriber?.ownerName ?? "Subscriber owner",
		planName: CurrentSubscriber
			? getMasterSubscriptionPlanName(CurrentSubscriber.planId)
			: "Current subscription",
		promotionId: promotion.id,
		promotionName: promotion.name,
		status: "Available",
		subscriberId: CurrentSubscriber?.id ?? WorkspaceCurrentBillingSubscriberId,
		subscriberName: CurrentSubscriber?.name ?? "Current subscriber",
		type: promotion.type,
		usedAt: null,
		value: promotion.value,
	};
}

function isWorkspaceVouchersAndCouponsApplicable(
	record: MasterSubscriberPromotionRecord,
	promotion: MasterPromotionRecord,
) {
	if (record.status !== "Available") {
		return false;
	}

	return isPromotionCurrentlyUsable(promotion, record.expiresAt);
}

function isPromotionCurrentlyUsable(
	promotion: MasterPromotionRecord,
	expiresAt: string | null,
) {
	if (promotion.status === "Inactive") {
		return false;
	}

	if (!expiresAt) {
		return true;
	}

	const expiryDate = new Date(`${expiresAt}T23:59:59`);

	return expiryDate >= new Date();
}

function isVoucherOrCoupon(
	value: MasterPromotionRecord["type"],
): value is WorkspaceVouchersAndCouponsType {
	return value === "Coupon" || value === "Voucher";
}

function isWorkspaceVouchersAndCouponsRecord(
	record: WorkspaceVouchersAndCouponsRecord | null,
): record is WorkspaceVouchersAndCouponsRecord {
	return record !== null;
}
