import { DefaultAccountApiPath } from "@/app/src/constants/modules/maintenance/default-account/DefaultAccountConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiDefaultAccount,
	ApiDefaultAccountExpenseParentOptionsResponse,
	ApiDefaultAccountListResponse,
	ApiDefaultAccountSaveResponse,
	ApiDefaultAccountStatus,
	DefaultAccount,
	DefaultAccountExpenseParentOption,
	DefaultAccountFormValues,
	DefaultAccountListResponse,
	DefaultAccountStatus,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";

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
			fixedAssetDefaultAccounts:
				response.data.statistics?.fixedAssetDefaultAccounts ??
				defaultAccounts.filter((account) => account.type === "FIXED_ASSET").length,
		},
		permissions: {
			canView: response.data.permissions?.canView ?? true,
			canCreate: response.data.permissions?.canCreate ?? true,
			canUpdate: response.data.permissions?.canUpdate ?? true,
			canDelete: response.data.permissions?.canDelete ?? true,
			canExport: response.data.permissions?.canExport ?? true,
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

