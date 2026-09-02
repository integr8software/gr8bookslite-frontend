export const CashDisbursementQuerySegment = "cash-disbursement";
export const CashDisbursementAllStatusFilter = "All";
export const CashDisbursementApiAllStatusFilter = "all";
export const CashDisbursementActiveStatus = "Active";
export const CashDisbursementActionModeAdd = "add";
export const CashDisbursementTaxTypeEwt = "EWT";
export const CashDisbursementTaxTypeVat = "VAT";
export const CashDisbursementTotalEntriesLabel = "Total Entries";
export const CashDisbursementAllTimeSummary = "All time";

export function createCashDisbursementListQueryKey<TFilters>(moduleKey: string, filters: TFilters) {
  return [CashDisbursementQuerySegment, moduleKey, "list", filters] as const;
}

export function createCashDisbursementModuleQueryKey(moduleKey: string) {
  return [CashDisbursementQuerySegment, moduleKey] as const;
}

export function createCashDisbursementRecordQueryKey(moduleKey: string, recordId?: string) {
  return [CashDisbursementQuerySegment, moduleKey, recordId] as const;
}
