import { EmptyBankDetails } from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsDefaults";
import type {
	ChartAccount,
	ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

export function createAccountFromForm(
	values: ChartAccountFormValues,
	id = `account-${Date.now()}`,
): ChartAccount {
	return {
		id,
		...values,
		bankDetails:
			values.accountCategory === "Cash in Bank"
				? values.bankDetails
				: undefined,
		children: [],
	};
}

export function accountToFormValues(
	account: ChartAccount,
): ChartAccountFormValues {
	return {
		accountNumber: account.accountNumber,
		accountName: account.accountName,
		parentId: account.parentId,
		accountType: account.accountType,
		statementGroup: account.statementGroup,
		statementSection: account.statementSection,
		normalBalance: account.normalBalance,
		accountCategory: account.accountCategory,
		description: account.description,
		status: account.status,
		showInReports: account.showInReports,
		bankDetails: account.bankDetails ?? EmptyBankDetails,
	};
}
