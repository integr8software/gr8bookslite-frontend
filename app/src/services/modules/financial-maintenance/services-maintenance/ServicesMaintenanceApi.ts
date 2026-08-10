import {
  servicesMaintenanceControllerCreateV1,
  servicesMaintenanceControllerFindAllV1,
  servicesMaintenanceControllerGetAccountOptionsV1,
  servicesMaintenanceControllerGetNextAccountCodeV1,
  servicesMaintenanceControllerUpdateStatusV1,
  servicesMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/services-maintenance/services-maintenance";
import type {
  CreateServiceMaintenanceDto,
  CreateServiceMaintenanceDtoAccountSetupMode,
  CreateServiceMaintenanceDtoStatus,
  ServiceMaintenanceAccountOptionResponseDto,
  ServiceMaintenanceNextAccountCodeResponseDto,
  ServiceMaintenanceResponseDto,
  ServiceMaintenanceResponseDtoAccountSetupMode,
  ServiceMaintenanceResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
  ServicesMaintenance,
  ServicesMaintenanceAccountSetupMode,
  ServicesMaintenanceFormValues,
  ServicesMaintenanceListResult,
  ServicesMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

export async function fetchServicesMaintenance(): Promise<ServicesMaintenanceListResult> {
  const response = await servicesMaintenanceControllerFindAllV1();

  return {
    services: response.services.map(mapApiService),
    statistics: {
      totalServices: response.statistics?.totalServices ?? 0,
      activeServices: response.statistics?.activeServices ?? 0,
      inactiveServices: response.statistics?.inactiveServices ?? 0,
      accountTitles: response.statistics?.accountTitles ?? 0,
    },
    permissions: {
      canView: response.permissions?.canView ?? false,
      canCreate: response.permissions?.canCreate ?? false,
      canUpdate: response.permissions?.canUpdate ?? false,
      canExport: response.permissions?.canExport ?? false,
      canImport: response.permissions?.canImport ?? response.permissions?.canCreate ?? false,
    },
  };
}

export async function fetchServicesMaintenanceAccountOptions(): Promise<ModuleChartAccount[]> {
  const response = await servicesMaintenanceControllerGetAccountOptionsV1();

  return response.accounts.map(mapApiAccountOption);
}

export async function fetchNextServiceRevenueAccountCode(): Promise<ServiceMaintenanceNextAccountCodeResponseDto> {
  return servicesMaintenanceControllerGetNextAccountCodeV1();
}

export async function createServiceMaintenance(values: ServicesMaintenanceFormValues): Promise<ServicesMaintenance> {
  const response = await servicesMaintenanceControllerCreateV1(toApiServicePayload(values));

  return mapApiService(response.service);
}

export async function updateServiceMaintenance(service: ServicesMaintenance): Promise<ServicesMaintenance> {
  const response = await servicesMaintenanceControllerUpdateV1(service.id, toApiServicePayload(service));

  return mapApiService(response.service);
}

export async function updateServiceMaintenanceStatus(service: ServicesMaintenance): Promise<ServicesMaintenance> {
  const response = await servicesMaintenanceControllerUpdateStatusV1(service.id, {
    status: mapStatusToApi(service.status),
  });

  return mapApiService(response.service);
}

function mapApiService(service: ServiceMaintenanceResponseDto): ServicesMaintenance {
  return {
    id: service.id,
    serviceName: service.serviceName,
    description: service.description ?? "",
    status: mapStatusFromApi(service.status),
    accountSetupMode: mapSetupModeFromApi(service.accountSetupMode),
    revenueCoaId: service.revenueCoaId,
    revenueAccountCode: service.revenueAccountCode,
    revenueAccountTitle: service.revenueAccountTitle,
    isGeneratedRevenueAccount: service.isGeneratedRevenueAccount,
    createdBy: service.createdBy,
    createdAt: service.createdAt,
    updatedBy: service.updatedBy,
    updatedAt: service.updatedAt ?? undefined,
  };
}

function mapApiAccountOption(account: ServiceMaintenanceAccountOptionResponseDto): ModuleChartAccount {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    accountType: account.accountType ?? "Revenue",
    statementGroup: account.statementGroup ?? "Income Statement",
    statementSection: account.statementSection ?? "Income Statement",
    normalBalance: account.normalBalance ?? "Credit",
    accountCategory: account.accountCategory ?? "Detail",
    description: account.description ?? "",
    status: account.status ?? "Active",
  };
}

function toApiServicePayload(service: ServicesMaintenance | ServicesMaintenanceFormValues): CreateServiceMaintenanceDto {
  return {
    serviceName: service.serviceName.trim(),
    description: service.description.trim(),
    status: mapStatusToApi(service.status),
    accountSetupMode: mapSetupModeToApi(service.accountSetupMode),
    revenueCoaId: service.accountSetupMode === "Existing" ? service.revenueCoaId : null,
  };
}

function mapStatusFromApi(value: ServiceMaintenanceResponseDtoStatus): ServicesMaintenanceStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ServicesMaintenanceStatus): CreateServiceMaintenanceDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapSetupModeFromApi(value: ServiceMaintenanceResponseDtoAccountSetupMode): ServicesMaintenanceAccountSetupMode {
  return value === "AUTO" ? "Auto" : "Existing";
}

function mapSetupModeToApi(value: ServicesMaintenanceAccountSetupMode): CreateServiceMaintenanceDtoAccountSetupMode {
  return value === "Auto" ? "AUTO" : "EXISTING";
}
