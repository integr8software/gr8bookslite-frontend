export const PurchaseOrderQueryKeys = {
  orders: () => ["purchasing", "purchase-order", "orders"] as const,
  copyFromCandidates: (
    target: "advances-to-suppliers",
    companyId?: number | null,
    branchUnitId?: number | null,
    partyCode?: string | null,
  ) => ["purchasing", "purchase-order", "copy-from", target, companyId ?? null, branchUnitId ?? null, partyCode ?? null] as const,
};
