/**
 * Generated-style API client for Accounts Payable Voucher.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  AccountsPayableVoucherNumberSuggestion,
  ApiAccountsPayableVoucherDetailResponse,
  ApiAccountsPayableVoucherListResponse,
  ApiAccountsPayableVoucherSaveResponse,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type {
  AccountsPayableVoucherPartyLookupResponse,
  AccountsPayableVoucherPayload,
  AccountsPayableVoucherPayableAccountLookupResponse,
  AccountsPayableVoucherResponsibilityCenterLookupResponse,
  AccountsPayableVoucherTermLookupResponse,
  UpdateAccountsPayableVoucherStatusDto,
} from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherApi";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export type AccountsPayableVoucherControllerFindAllV1Params = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?:
    | "transactionNo"
    | "documentDate"
    | "partyName"
    | "payableType"
    | "amount"
    | "currency"
    | "status"
    | "createdAt"
    | "updatedAt";
  sortDirection?: "asc" | "desc";
  status?: string;
};

export type AccountsPayableVoucherControllerFindOneV1Params = Pick<
  AccountsPayableVoucherControllerFindAllV1Params,
  "branchUnitId"
>;

export type AccountsPayableVoucherControllerSuggestTransactionNumberV1Params =
  Pick<AccountsPayableVoucherControllerFindAllV1Params, "branchUnitId">;

const AccountsPayableVoucherUrl =
  "/api/v1/accounts-payable/accounts-payable-voucher";

export const accountsPayableVoucherControllerFindAllV1 = (
  params?: AccountsPayableVoucherControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ApiAccountsPayableVoucherListResponse>(
    {
      url: AccountsPayableVoucherUrl,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerSuggestTransactionNumberV1 = (
  params?: AccountsPayableVoucherControllerSuggestTransactionNumberV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<AccountsPayableVoucherNumberSuggestion>(
    {
      url: `${AccountsPayableVoucherUrl}/transaction-number`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerFindPartyOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<AccountsPayableVoucherPartyLookupResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/lookups/parties`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerFindTermOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<AccountsPayableVoucherTermLookupResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/lookups/terms`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerFindResponsibilityCenterOptionsV1 =
  (options?: SecondParameter<typeof OrvalApiClient>, signal?: AbortSignal) => {
    return OrvalApiClient<AccountsPayableVoucherResponsibilityCenterLookupResponse>(
      {
        url: `${AccountsPayableVoucherUrl}/lookups/responsibility-centers`,
        method: "GET",
        signal,
      },
      options,
    );
  };

export const accountsPayableVoucherControllerFindPayableAccountOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<AccountsPayableVoucherPayableAccountLookupResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/lookups/payable-accounts`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerFindOneV1 = (
  id: string,
  params?: AccountsPayableVoucherControllerFindOneV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ApiAccountsPayableVoucherDetailResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/${id}`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerCreateV1 = (
  createAccountsPayableVoucherDto: AccountsPayableVoucherPayload,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ApiAccountsPayableVoucherSaveResponse>(
    {
      url: AccountsPayableVoucherUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createAccountsPayableVoucherDto,
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerUpdateV1 = (
  id: string,
  updateAccountsPayableVoucherDto: AccountsPayableVoucherPayload,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ApiAccountsPayableVoucherSaveResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateAccountsPayableVoucherDto,
      signal,
    },
    options,
  );
};

export const accountsPayableVoucherControllerUpdateStatusV1 = (
  id: string,
  updateAccountsPayableVoucherStatusDto: UpdateAccountsPayableVoucherStatusDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ApiAccountsPayableVoucherSaveResponse>(
    {
      url: `${AccountsPayableVoucherUrl}/${id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateAccountsPayableVoucherStatusDto,
      signal,
    },
    options,
  );
};
