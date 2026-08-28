export const BankReconciliationQueryKeys = {
  all: ["cash-receipt", "bank-reconciliation"] as const,
  lists: () => [...BankReconciliationQueryKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...BankReconciliationQueryKeys.lists(), params] as const,
  details: () => [...BankReconciliationQueryKeys.all, "detail"] as const,
  detail: (id?: string) =>
    [...BankReconciliationQueryKeys.details(), id] as const,
};
