export const PettyCashFundQueryKeys = {
  all: () => ["cash-disbursement", "petty-cash-fund"] as const,
  list: (filters: unknown) => ["cash-disbursement", "petty-cash-fund", "list", filters] as const,
  record: (recordId?: string) => ["cash-disbursement", "petty-cash-fund", recordId] as const,
};
