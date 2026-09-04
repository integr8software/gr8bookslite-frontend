export const DiscountMaintenanceQueryKeys = {
  all: () => ["discountManagement"] as const,
  discounts: () => [...DiscountMaintenanceQueryKeys.all(), "discounts"] as const,
};
