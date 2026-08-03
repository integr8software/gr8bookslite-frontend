/**
 * Generated-style API client for Bank Masterfile.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  BankAccountContainerResponseDto,
  BankAccountListResponseDto,
  BankAccountOptionsResponseDto,
  BankMasterfileControllerFindAllV1Params,
  BankMasterfileControllerFindOptionsV1Params,
  BankMasterfileLookupControllerFindOptionsV1Params,
  BankNextAccountCodeResponseDto,
  CreateBankAccountDto,
  ImportBankAccountsDto,
  ImportBankAccountsResponseDto,
  SaveBankAccountResponseDto,
  UpdateBankAccountDto,
  UpdateBankAccountStatusDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const bankMasterfileControllerFindAllV1 = (
  params?: BankMasterfileControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<BankAccountListResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerFindOptionsV1 = (
  params?: BankMasterfileControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<BankAccountOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerGetNextAccountCodeV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<BankNextAccountCodeResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/next-account-code`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<BankAccountContainerResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerCreateV1 = (
  createBankAccountDto: CreateBankAccountDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveBankAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createBankAccountDto,
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerImportBankAccountsV1 = (
  importBankAccountsDto: ImportBankAccountsDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportBankAccountsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importBankAccountsDto,
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerUpdateV1 = (
  id: string,
  updateBankAccountDto: UpdateBankAccountDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveBankAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateBankAccountDto,
      signal,
    },
    options,
  );
};

export const bankMasterfileControllerUpdateStatusV1 = (
  id: string,
  updateBankAccountStatusDto: UpdateBankAccountStatusDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveBankAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/bank-masterfile/${id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateBankAccountStatusDto,
      signal,
    },
    options,
  );
};

export const bankMasterfileLookupControllerFindOptionsV1 = (
  params?: BankMasterfileLookupControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<BankAccountOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/bank-masterfile/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};
