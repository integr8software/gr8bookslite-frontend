import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	BankMasterfile,
	BankMasterfileFormValues,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

type ApiBankStatus = "ACTIVE" | "INACTIVE";

type ApiBank = {
	id: string;
	accountCode: string;
	bankName: string;
	branch: string | null;
	accountNumber: string;
	accountName: string;
	accountType: string | null;
	currencyCode: string | null;
	currencyExchangeRate: string | null;
	isDefault: boolean;
	seriesStart: string | null;
	seriesEnd: string | null;
	seriesDigits: number | null;
	status: ApiBankStatus;
	createdAt: string;
	updatedAt: string;
};

export type BankMasterfilePermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type BankMasterfileStatistics = {
	totalBanks: number;
	activeBanks: number;
	inactiveBanks: number;
	defaultBanks: number;
};

export type BankMasterfileListResponse = {
	banks: BankMasterfile[];
	statistics: BankMasterfileStatistics;
	permissions: BankMasterfilePermissions;
};

type ApiBankListResponse = {
	bankAccounts: ApiBank[];
	statistics?: Partial<BankMasterfileStatistics>;
	permissions?: Partial<BankMasterfilePermissions>;
};

type ApiBankSaveResponse = {
	bankAccount: ApiBank;
};

type ApiBankImportResponse = {
	bankAccounts: ApiBank[];
};

type ApiNextAccountCodeResponse = {
	accountCode: string;
	parentAccountCode: string;
	parentAccountTitle: string;
};

const BankMasterfilePath = "/maintenance/financial-management/bank-masterfile";

export async function fetchBanks(): Promise<BankMasterfileListResponse> {
	const response = await ApiClient.get<ApiBankListResponse>(BankMasterfilePath);
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
		`${BankMasterfilePath}/next-account-code`,
	);

	return response.data;
}

export async function createBank(
	values: BankMasterfileFormValues,
): Promise<BankMasterfile> {
	const response = await ApiClient.post<ApiBankSaveResponse>(
		BankMasterfilePath,
		toApiBankPayload(values),
	);

	return mapApiBank(response.data.bankAccount);
}

export async function updateBank(
	bank: BankMasterfile,
): Promise<BankMasterfile> {
	const response = await ApiClient.patch<ApiBankSaveResponse>(
		`${BankMasterfilePath}/${bank.id}`,
		toApiBankPayload(bank),
	);

	return mapApiBank(response.data.bankAccount);
}

export async function updateBankStatus(
	bank: BankMasterfile,
): Promise<BankMasterfile> {
	const response = await ApiClient.patch<ApiBankSaveResponse>(
		`${BankMasterfilePath}/${bank.id}/status`,
		{ status: mapStatusToApi(bank.status) },
	);

	return mapApiBank(response.data.bankAccount);
}
export async function importBanks(
	banks: BankMasterfileFormValues[],
): Promise<BankMasterfile[]> {
	const response = await ApiClient.post<ApiBankImportResponse>(
		`${BankMasterfilePath}/import`,
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
		createdAt: bank.createdAt,
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
