import { EmptyBankDetails } from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsDefaults";
import type {
  ChartAccount,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function accountToFormValues(
  account: ChartAccount,
): ChartAccountFormValues {
  return {
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    accountLevel: account.accountLevel,
    parentId: account.parentId,
    accountType: account.accountType,
    statementGroup: account.statementGroup,
    statementSection: account.statementSection,
    normalBalance: account.normalBalance,
    description: account.description,
    status: account.status,
    showInReports: account.showInReports,
    isPostingAccount: account.isPostingAccount,
    bankDetails: account.bankDetails ?? EmptyBankDetails,
  };
}
