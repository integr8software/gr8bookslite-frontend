export const TransactionOverviewColumnWidths = {
  transactionNumber: 180,
  documentDate: 140,
  partyCode: 130,
  partyName: 260,
  accountCode: 150,
  accountTitle: 240,
  paymentType: 160,
  currency: 100,
  exchangeRate: 130,
  amount: 160,
  remarks: 260,
  auditUser: 160,
  auditDate: 170,
  status: 120,
  actions: 160,
} as const;

export function getTransactionOverviewTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[158rem]";
  if (visibleColumnCount >= 10) return "min-w-[126rem]";
  return "min-w-[76rem]";
}
