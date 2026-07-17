import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { BankMasterfileApiPath } from "@/app/src/constants/modules/maintenance/bank-masterfile/BankMasterfileConstants";
import type {
	ApiBank,
	ApiBankImportResponse,
	ApiBankListResponse,
	ApiBankSaveResponse,
	ApiBankStatus,
	ApiNextAccountCodeResponse,
	BankMasterfile,
	BankMasterfileFormValues,
	BankMasterfileListResponse,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export async function fetchBanks(): Promise<BankMasterfileListResponse> {
	const response = await ApiClient.get<ApiBankListResponse>(BankMasterfileApiPath);
	const banks = response.data.bankAccounts.map(mapApiBank);

	return {
		banks,
		statistics: {
			totalBanks: response.data.statistics?.totalBanks ?? banks.length,
			activeBanks:
				response.data.statistics?.activeBanks ??
				banks.filter((bank) => bank.status === "Active").length,
			inactiveBanks:
				response.data.statistics?.inactiveBanks ??
				banks.filter((bank) => bank.status === "Inactive").length,
			defaultBanks: banks.filter((bank) => bank.isDefault).length,
		},
		permissions: {
			canView: response.data.permissions?.canView ?? true,
			canCreate: response.data.permissions?.canCreate ?? true,
			canUpdate: response.data.permissions?.canUpdate ?? true,
			canExport: response.data.permissions?.canExport ?? true,
			canImport: response.data.permissions?.canImport ?? true,
		},
	};
}

export async function fetchNextBankAccountCode() {
	const response = await ApiClient.get<ApiNextAccountCodeResponse>(
		`${BankMasterfileApiPath}/next-account-code`,
	);

	return response.data;
}

export async function createBank(
	values: BankMasterfileFormValues,
): Promise<BankMasterfile> {
	const response = await ApiClient.post<ApiBankSaveResponse>(
		BankMasterfileApiPath,
		toApiBankPayload(values),
	);

	return mapApiBank(response.data.bankAccount);
}

export async function updateBank(
	bank: BankMasterfile,
): Promise<BankMasterfile> {
	const response = await ApiClient.patch<ApiBankSaveResponse>(
		`${BankMasterfileApiPath}/${bank.id}`,
		toApiBankPayload(bank),
	);

	return mapApiBank(response.data.bankAccount);
}

export async function updateBankStatus(
	bank: BankMasterfile,
): Promise<BankMasterfile> {
	const response = await ApiClient.patch<ApiBankSaveResponse>(
		`${BankMasterfileApiPath}/${bank.id}/status`,
		{ status: mapStatusToApi(bank.status) },
	);

	return mapApiBank(response.data.bankAccount);
}
export async function importBanks(
	banks: BankMasterfileFormValues[],
): Promise<BankMasterfile[]> {
	const response = await ApiClient.post<ApiBankImportResponse>(
		`${BankMasterfileApiPath}/import`,
		{
			banks: banks.map(toApiBankPayload),
		},
	);

	return response.data.bankAccounts.map(mapApiBank);
}

function mapApiBank(bank: ApiBank): BankMasterfile {
	return {
		id: bank.id,
		accountCode: bank.accountCode,
		accountTitle:
			bank.chartAccount?.accountTitle ?? bank.accountTitle ?? bank.accountName,
		bankName: bank.bankName,
		branch: bank.branch ?? "",
		accountNumber: bank.accountNumber,
		accountName: bank.accountName,
		accountType: bank.accountType ?? "",
		currencyCode: bank.currencyCode ?? "PHP",
		currencyExchangeRate: bank.currencyExchangeRate ?? "",
		isDefault: bank.isDefault,
		seriesStart: bank.seriesStart ?? "",
		seriesEnd: bank.seriesEnd ?? "",
		seriesDigits: bank.seriesDigits ? String(bank.seriesDigits) : "",
		status: mapStatusFromApi(bank.status),
		createdBy: bank.createdBy,
		createdAt: bank.createdAt,
		updatedBy: bank.updatedBy,
		updatedAt: bank.updatedAt,
	};
}

function toApiBankPayload(bank: BankMasterfile | BankMasterfileFormValues) {
	return {
		bankName: bank.bankName.trim(),
		branch: cleanOptional(bank.branch),
		accountNumber: cleanOptional(bank.accountNumber),
		accountType: cleanOptional(bank.accountType),
		currencyCode: cleanOptional(bank.currencyCode),
		currencyExchangeRate: toOptionalNumber(bank.currencyExchangeRate),
		seriesStart: cleanOptional(bank.seriesStart),
		seriesEnd: cleanOptional(bank.seriesEnd),
		seriesDigits: toOptionalNumber(bank.seriesDigits),
		isDefault: bank.isDefault,
		status: mapStatusToApi(bank.status),
	};
}

function mapStatusFromApi(value: ApiBankStatus): BankMasterfileStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: BankMasterfileStatus): ApiBankStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function cleanOptional(value: string) {
	return value.trim() || undefined;
}

function toOptionalNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

