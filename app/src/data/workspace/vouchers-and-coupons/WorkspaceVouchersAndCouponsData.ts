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
import type { WorkspaceVouchersAndCouponsRecord } from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";

export const WorkspaceVouchersAndCouponsRecords =
  MasterSubscriberPromotionRecords.map(
    createWorkspaceVouchersAndCouponsRecord,
  );

export function formatWorkspaceVouchersAndCouponsDate(
  value: string | null,
) {
  return formatMasterSubscriberPromotionDate(value);
}

export function formatWorkspaceVouchersAndCouponsExpiry(
  value: string | null,
) {
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

function createWorkspaceVouchersAndCouponsRecord(
  record: MasterSubscriberPromotionRecord,
): WorkspaceVouchersAndCouponsRecord {
  const promotion = getMasterPromotionById(record.promotionId);

  return {
    assignedAt: record.assignedAt,
    assignmentId: record.id,
    assignmentMode: record.assignmentMode,
    canApply: promotion
      ? isWorkspaceVouchersAndCouponsApplicable(record, promotion)
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

function isWorkspaceVouchersAndCouponsApplicable(
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
