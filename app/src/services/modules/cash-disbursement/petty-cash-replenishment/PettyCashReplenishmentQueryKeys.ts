export const PettyCashReplenishmentQueryKeys = {
  all: () => ["cash-disbursement", "petty-cash-replenishment"] as const,
  list: (filters: unknown) => ["cash-disbursement", "petty-cash-replenishment", "list", filters] as const,
  record: (recordId?: string) => ["cash-disbursement", "petty-cash-replenishment", recordId] as const,
};
