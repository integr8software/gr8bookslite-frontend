import type {
  WorkspaceVouchersAndCouponsStatusFilter,
  WorkspaceVouchersAndCouponsTableColumnKey,
  WorkspaceVouchersAndCouponsTypeFilter,
} from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";

export const WorkspaceVouchersAndCouponsHref =
  "/workspace/vouchers-and-coupons";

export const WorkspaceVouchersAndCouponsPaginationStorageKey =
  "workspace-vouchers-and-coupons";

export const WorkspaceVouchersAndCouponsStatusOptions = [
  "All",
  "Available",
  "Used",
  "Expired",
  "Revoked",
] as const satisfies readonly WorkspaceVouchersAndCouponsStatusFilter[];

export const WorkspaceVouchersAndCouponsTypeOptions = [
  "All",
  "Coupon",
  "Voucher",
] as const satisfies readonly WorkspaceVouchersAndCouponsTypeFilter[];

export const WorkspaceVouchersAndCouponsTableColumns = [
  { key: "subscriberName", label: "Company", className: "w-[20rem]" },
  { key: "promotionName", label: "Voucher/Coupon", className: "w-[18rem]" },
  { key: "type", label: "Type", className: "w-[10rem]" },
  { key: "value", label: "Value", className: "w-[9rem]" },
  { key: "status", label: "Subscriber Status", className: "w-[12rem]" },
  { key: "masterStatus", label: "Master Status", className: "w-[11rem]" },
  { key: "expiresAt", label: "Expires", className: "w-[11rem]" },
  { label: "Actions", className: "w-[6rem] text-right" },
] as const satisfies readonly (
  | {
      key: WorkspaceVouchersAndCouponsTableColumnKey;
      label: string;
      className: string;
    }
  | { label: string; className: string }
)[];
