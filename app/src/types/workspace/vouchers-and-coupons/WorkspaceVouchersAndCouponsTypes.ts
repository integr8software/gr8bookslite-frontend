import type {
  MasterPromotionDiscountKind,
  MasterPromotionStatus,
  MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type {
  MasterSubscriberPromotionAssignmentMode,
  MasterSubscriberPromotionStatus,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";

export type WorkspaceVouchersAndCouponsType = Extract<
  MasterPromotionType,
  "Coupon" | "Voucher"
>;

export type WorkspaceVouchersAndCouponsRecord = {
  assignedAt: string;
  assignmentId: string;
  assignmentMode: MasterSubscriberPromotionAssignmentMode;
  canApply: boolean;
  code: string;
  description: string;
  discountKind: MasterPromotionDiscountKind;
  expiresAt: string | null;
  grantedBy: string;
  invoiceNo: string | null;
  masterStatus: MasterPromotionStatus;
  notes: string;
  ownerName: string;
  planName: string;
  promotionId: string;
  promotionName: string;
  status: MasterSubscriberPromotionStatus;
  subscriberId: string;
  subscriberName: string;
  type: WorkspaceVouchersAndCouponsType;
  usedAt: string | null;
  value: number;
};

export type WorkspaceVouchersAndCouponsStatusFilter =
  | "All"
  | MasterSubscriberPromotionStatus;

export type WorkspaceVouchersAndCouponsTypeFilter =
  | "All"
  | WorkspaceVouchersAndCouponsType;

export type WorkspaceVouchersAndCouponsTableColumnKey =
  | "subscriberName"
  | "promotionName"
  | "type"
  | "value"
  | "status"
  | "masterStatus"
  | "expiresAt";
