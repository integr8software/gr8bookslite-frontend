export {
  EmptyAccountFormValues,
  EmptyBankDetails,
} from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
export { accountToFormValues } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsMappers";
export {
  flattenAccounts,
  getCanDropOnAccount,
  getDropPlacementMode,
  getPointerDropPlacement,
  isSpecificAccount,
  isSpecificAccountLevel,
  isSpecificAccountNumber,
  moveOrReorderAccount,
} from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTree";

export function getAccountPercentage(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

