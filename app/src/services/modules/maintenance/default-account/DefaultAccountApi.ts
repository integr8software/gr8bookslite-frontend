import { DefaultAccountApiPath } from "@/app/src/constants/modules/maintenance/financial-management/default-account/DefaultAccountConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiDefaultAccount,
	ApiDefaultAccountListResponse,
	ApiDefaultAccountSaveResponse,
	ApiDefaultAccountStatus,
	DefaultAccount,
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

export async function deleteDefaultAccount(
	account: DefaultAccount,
): Promise<DefaultAccount> {
	const response = await ApiClient.delete<ApiDefaultAccountSaveResponse>(
		`${DefaultAccountApiPath}/${account.id}`,
	);

	return mapApiDefaultAccount(response.data.defaultAccount);
}

function mapApiDefaultAccount(account: ApiDefaultAccount): DefaultAccount {
	return {
		id: account.id,
		type: account.type,
		description: account.description,
		status: mapStatusFromApi(account.status),
		generatedAccounts: account.generatedAccounts,
		createdAt: account.createdAt,
		updatedAt: account.updatedAt,
	};
}

function toApiPayload(account: DefaultAccount | DefaultAccountFormValues) {
	return {
		type: account.type,
		description: account.description.trim(),
		status: mapStatusToApi(account.status),
	};
}

function mapStatusFromApi(value: ApiDefaultAccountStatus): DefaultAccountStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DefaultAccountStatus): ApiDefaultAccountStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}
