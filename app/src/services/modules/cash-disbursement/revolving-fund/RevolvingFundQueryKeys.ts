export const RevolvingFundQueryKeys = {
  all: () => ["cash-disbursement", "revolving-fund"] as const,
  list: (filters: unknown) => ["cash-disbursement", "revolving-fund", "list", filters] as const,
  record: (recordId?: string) => ["cash-disbursement", "revolving-fund", recordId] as const,
};
