import { DefaultAccountApiPath } from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiDefaultAccount,
	ApiDefaultAccountExpenseParentOptionsResponse,
	ApiDefaultAccountExpenseSubAccountSaveResponse,
	ApiDefaultAccountListResponse,
	ApiDefaultAccountSaveResponse,
	ApiDefaultAccountStatus,
	DefaultAccount,
	DefaultAccountExpenseParentOption,
	DefaultAccountFormValues,
	DefaultAccountListResponse,
	DefaultAccountStatus,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ChartAccountFormValues } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

type SaveDefaultAccountExpenseSubAccountPayload = {
	parentAccountId?: string;
	accountLevel?: string;
	accountTitle: string;
	accountType?: string;
	accountNature?: string;
	accountGroup?: string | string[];
	statementSection?: string;
	reportAlias?: string;
	description?: string;
	isPostingAccount?: boolean;
	showTotal?: boolean;
	status?: ApiDefaultAccountStatus;
};

export async function fetchDefaultAccounts(): Promise<DefaultAccountListResponse> {
	const response = await ApiClient.get<ApiDefaultAccountListResponse>(
		DefaultAccountApiPath,
	);
	const defaultAccounts = response.data.defaultAccounts.map(mapApiDefaultAccount);

	return {
		defaultAccounts,
		statistics: {
			totalDefaultAccounts:
				response.data.statistics?.totalDefaultAccounts ?? defaultAccounts.length,
			activeDefaultAccounts:
				response.data.statistics?.activeDefaultAccounts ??
				defaultAccounts.filter((account) => account.status === "Active").length,
			inactiveDefaultAccounts:
				response.data.statistics?.inactiveDefaultAccounts ??
				defaultAccounts.filter((account) => account.status === "Inactive").length,
			expenseDefaultAccounts:
				response.data.statistics?.expenseDefaultAccounts ??
				defaultAccounts.filter((account) => account.type === "EXPENSE").length,
			collectionDefaultAccounts:
				response.data.statistics?.collectionDefaultAccounts ??
				defaultAccounts.filter((account) => account.type === "COLLECTION").length,
		},
		permissions: {
			canView: response.data.permissions?.canView ?? false,
			canCreate: response.data.permissions?.canCreate ?? false,
			canUpdate: response.data.permissions?.canUpdate ?? false,
			canCancel: response.data.permissions?.canCancel ?? false,
			canExport: response.data.permissions?.canExport ?? false,
			canImport:
				response.data.permissions?.canImport ??
				response.data.permissions?.canCreate ??
				false,
		},
	};
}

export async function createDefaultAccount(
	values: DefaultAccountFormValues,
): Promise<DefaultAccount> {
	const response = await ApiClient.post<ApiDefaultAccountSaveResponse>(
		DefaultAccountApiPath,
		toApiPayload(values),
	);

	return mapApiDefaultAccount(response.data.defaultAccount);
}

export async function fetchDefaultAccountExpenseParentOptions(): Promise<
	DefaultAccountExpenseParentOption[]
> {
	const response =
		await ApiClient.get<ApiDefaultAccountExpenseParentOptionsResponse>(
			`${DefaultAccountApiPath}/expense-parent-options`,
		);

	return response.data.options;
}

export async function updateDefaultAccount(
	account: DefaultAccount,
): Promise<DefaultAccount> {
	const response = await ApiClient.patch<ApiDefaultAccountSaveResponse>(
		`${DefaultAccountApiPath}/${account.id}`,
		toApiPayload(account),
	);

	return mapApiDefaultAccount(response.data.defaultAccount);
}

export async function updateDefaultAccountStatus(
	account: DefaultAccount,
): Promise<DefaultAccount> {
	const response = await ApiClient.patch<ApiDefaultAccountSaveResponse>(
		`${DefaultAccountApiPath}/${account.id}/status`,
		{ status: mapStatusToApi(account.status) },
	);

	return mapApiDefaultAccount(response.data.defaultAccount);
}

export async function createDefaultAccountExpenseSubAccount(
	values: ChartAccountFormValues & { accountGroup?: string | string[] },
) {
	const response = await ApiClient.post<ApiDefaultAccountExpenseSubAccountSaveResponse>(
		`${DefaultAccountApiPath}/expense-sub-accounts`,
		createDefaultAccountExpenseSubAccountPayload(values),
	);

	return response.data.account;
}

function createDefaultAccountExpenseSubAccountPayload(
	values: ChartAccountFormValues & { accountGroup?: string | string[] },
): SaveDefaultAccountExpenseSubAccountPayload {
	return {
		accountGroup: values.accountGroup ?? "",
		accountLevel: values.accountLevel || undefined,
		accountNature: values.normalBalance || undefined,
		accountTitle: values.accountName,
		accountType: values.accountType || undefined,
		description: values.description || undefined,
		isPostingAccount: values.isPostingAccount,
		parentAccountId: values.parentId ?? undefined,
		reportAlias: values.showInReports ? values.reportAlias : "",
		statementSection: values.statementSection,
		showTotal: values.showInReports,
		status: values.status ? mapStatusToApi(values.status) : undefined,
	};
}

function mapApiDefaultAccount(account: ApiDefaultAccount): DefaultAccount {
	return {
		id: account.id,
		type: account.type,
		defaultAccountName: account.defaultAccountName,
		description: account.description ?? "",
		status: mapStatusFromApi(account.status),
		expenseParentCoaId: account.expenseParentCoaId ?? undefined,
		generatedAccounts: account.generatedAccounts,
		createdBy: account.createdBy,
		createdAt: account.createdAt,
		updatedBy: account.updatedBy,
		updatedAt: account.updatedAt,
	};
}

function toApiPayload(account: DefaultAccount | DefaultAccountFormValues) {
	return {
		type: account.type,
		defaultAccountName: account.defaultAccountName.trim(),
		description: account.description.trim(),
		status: mapStatusToApi(account.status),
		expenseParentCoaId:
			account.type === "EXPENSE" ? account.expenseParentCoaId || undefined : undefined,
	};
}

function mapStatusFromApi(value: ApiDefaultAccountStatus): DefaultAccountStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DefaultAccountStatus): ApiDefaultAccountStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

