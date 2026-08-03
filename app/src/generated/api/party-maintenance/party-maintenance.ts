/**
 * Generated-style API client for Party Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreatePartyDto,
  ImportPartiesDto,
  ImportPartiesResponseDto,
  PartyAccountingOptionsResponseDto,
  PartyContainerResponseDto,
  PartyListResponseDto,
  PartyMaintenanceControllerFindAllV1Params,
  PartyMaintenanceControllerFindOptionsV1PartyType,
  PartyOptionsResponseDto,
  SavePartyResponseDto,
  UpdatePartyDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const partyMaintenanceControllerFindAllV1 = (
  params?: PartyMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PartyListResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerFindAccountingOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PartyAccountingOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance/accounting-options`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerFindOptionsV1 = (
  partyType: PartyMaintenanceControllerFindOptionsV1PartyType,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PartyOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance/options/${partyType}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PartyContainerResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerCreateV1 = (
  createPartyDto: CreatePartyDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SavePartyResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createPartyDto,
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerImportPartiesV1 = (
  importPartiesDto: ImportPartiesDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportPartiesResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importPartiesDto,
      signal,
    },
    options,
  );
};

export const partyMaintenanceControllerUpdateV1 = (
  id: string,
  updatePartyDto: UpdatePartyDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SavePartyResponseDto>(
    {
      url: `/api/v1/maintenance/party-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updatePartyDto,
      signal,
    },
    options,
  );
};
