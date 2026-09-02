import {
  bankMasterfileControllerCreateV1,
  bankMasterfileControllerFindAllV1,
  bankMasterfileControllerGetNextAccountCodeV1,
  bankMasterfileControllerImportBankAccountsV1,
  bankMasterfileControllerUpdateStatusV1,
  bankMasterfileControllerUpdateV1,
} from "@/app/src/generated/api/bank-masterfile/bank-masterfile";
import type {
  BankAccountResponseDto,
  BankAccountResponseDtoStatus,
  BankNextAccountCodeResponseDto,
  CreateBankAccountDto,
  CreateBankAccountDtoStatus,
  UpdateBankAccountDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  mapBankAccountTypeFromApi,
  requireBankAccountTypeToApi,
} from "@/app/src/services/modules/financial-maintenance/bank-masterfile/BankAccountTypeMapper";
import type {
  BankMasterfile,
  BankMasterfileFormValues,
  BankMasterfileListResult,
  BankMasterfileStatus,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { cleanOptional } from "@/app/src/utils/string.util";

export async function fetchBanks(): Promise<BankMasterfileListResult> {
  const response = await bankMasterfileControllerFindAllV1();
  const banks = response.bankAccounts.map(mapApiBank);

  return {
    banks,
    statistics: {
      totalBanks: response.statistics?.totalBanks ?? banks.length,
      activeBanks: response.statistics?.activeBanks ?? banks.filter((bank) => bank.status === "Active").length,
      inactiveBanks: response.statistics?.inactiveBanks ?? banks.filter((bank) => bank.status === "Inactive").length,
      defaultBanks: response.statistics?.defaultBanks ?? banks.filter((bank) => bank.isDefault).length,
    },
    permissions: {
      canView: response.permissions?.canView ?? true,
      canCreate: response.permissions?.canCreate ?? true,
      canUpdate: response.permissions?.canUpdate ?? true,
      canExport: response.permissions?.canExport ?? true,
      canImport: response.permissions?.canImport ?? true,
    },
  };
}

export async function fetchNextBankAccountCode(): Promise<BankNextAccountCodeResponseDto> {
  return bankMasterfileControllerGetNextAccountCodeV1();
}

export async function createBank(values: BankMasterfileFormValues): Promise<BankMasterfile> {
  const response = await bankMasterfileControllerCreateV1(toApiBankPayload(values));

  return mapApiBank(response.bankAccount);
}

export async function updateBank(bank: BankMasterfile): Promise<BankMasterfile> {
  const response = await bankMasterfileControllerUpdateV1(bank.id, toApiUpdateBankPayload(bank));

  return mapApiBank(response.bankAccount);
}

export async function updateBankStatus(bank: BankMasterfile): Promise<BankMasterfile> {
  const response = await bankMasterfileControllerUpdateStatusV1(bank.id, {
    status: mapStatusToApi(bank.status),
  });

  return mapApiBank(response.bankAccount);
}
export async function importBanks(banks: BankMasterfileFormValues[]): Promise<BankMasterfile[]> {
  const response = await bankMasterfileControllerImportBankAccountsV1({
    banks: banks.map(toApiBankPayload),
  });

  return response.bankAccounts.map(mapApiBank);
}

function mapApiBank(bank: BankAccountResponseDto): BankMasterfile {
  return {
    id: bank.id,
    accountCode: bank.accountCode,
    accountTitle: bank.chartAccount?.accountTitle ?? bank.accountName,
    bankName: bank.bankName,
    branch: bank.branch ?? "",
    accountNumber: bank.accountNumber,
    accountName: bank.accountName,
    accountType: bank.accountType ? mapBankAccountTypeFromApi(bank.accountType) : "",
    currencyCode: bank.currencyCode ?? "PHP",
    isDefault: bank.isDefault,
    seriesStart: bank.seriesStart ?? "",
    seriesEnd: bank.seriesEnd ?? "",
    seriesDigits: bank.seriesDigits ? String(bank.seriesDigits) : "",
    status: mapStatusFromApi(bank.status),
    createdBy: bank.createdBy,
    createdAt: bank.createdAt,
    updatedBy: bank.updatedBy,
    updatedAt: bank.updatedAt ?? undefined,
  };
}

function toApiBankPayload(bank: BankMasterfileFormValues): CreateBankAccountDto {
  return {
    bankName: bank.bankName.trim(),
    branch: cleanOptional(bank.branch),
    accountNumber: cleanOptional(bank.accountNumber),
    accountType: requireBankAccountTypeToApi(bank.accountType),
    currencyCode: cleanOptional(bank.currencyCode),
    seriesStart: bank.seriesStart.trim(),
    seriesEnd: bank.seriesEnd.trim(),
    seriesDigits: Number(bank.seriesDigits),
    isDefault: bank.isDefault,
    status: mapStatusToApi(bank.status),
  };
}

function toApiUpdateBankPayload(bank: BankMasterfile): UpdateBankAccountDto {
  return {
    bankName: bank.bankName.trim(),
    branch: cleanOptional(bank.branch),
    accountNumber: cleanOptional(bank.accountNumber),
    accountName: cleanOptional(bank.accountName),
    accountType: requireBankAccountTypeToApi(bank.accountType),
    currencyCode: cleanOptional(bank.currencyCode),
    seriesStart: bank.seriesStart.trim(),
    seriesEnd: bank.seriesEnd.trim(),
    seriesDigits: Number(bank.seriesDigits),
    isDefault: bank.isDefault,
    status: mapStatusToApi(bank.status),
  };
}

function mapStatusFromApi(value: BankAccountResponseDtoStatus): BankMasterfileStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: BankMasterfileStatus): CreateBankAccountDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
