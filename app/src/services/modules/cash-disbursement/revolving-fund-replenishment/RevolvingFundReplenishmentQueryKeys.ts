export const RevolvingFundReplenishmentQueryKeys = {
  all: () => ["cash-disbursement", "revolving-fund-replenishment"] as const,
  list: (filters: unknown) => ["cash-disbursement", "revolving-fund-replenishment", "list", filters] as const,
  record: (recordId?: string) => ["cash-disbursement", "revolving-fund-replenishment", recordId] as const,
};
