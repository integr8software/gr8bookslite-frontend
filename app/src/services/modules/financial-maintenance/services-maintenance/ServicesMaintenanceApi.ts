import { ServicesMaintenanceApiPath } from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiServicesMaintenance,
	ApiServicesMaintenanceAccountOptionsResponse,
	ApiServicesMaintenanceAccountSetupMode,
	ApiServicesMaintenanceListResponse,
	ApiServicesMaintenanceNextAccountCodeResponse,
	ApiServicesMaintenanceSaveResponse,
	ApiServicesMaintenanceStatus,
	ServicesMaintenance,
	ServicesMaintenanceAccountSetupMode,
	ServicesMaintenanceFormValues,
	ServicesMaintenanceListResponse,
	ServicesMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

export async function fetchServicesMaintenance(): Promise<ServicesMaintenanceListResponse> {
	const response = await ApiClient.get<ApiServicesMaintenanceListResponse>(
		ServicesMaintenanceApiPath,
	);

	return {
		services: response.data.services.map(mapApiService),
		statistics: {
			totalServices: response.data.statistics?.totalServices ?? 0,
			activeServices: response.data.statistics?.activeServices ?? 0,
			inactiveServices: response.data.statistics?.inactiveServices ?? 0,
			accountTitles: response.data.statistics?.accountTitles ?? 0,
		},
		permissions: {
			canView: response.data.permissions?.canView ?? false,
			canCreate: response.data.permissions?.canCreate ?? false,
			canUpdate: response.data.permissions?.canUpdate ?? false,
			canExport: response.data.permissions?.canExport ?? false,
			canImport:
				response.data.permissions?.canImport ??
				response.data.permissions?.canCreate ??
				false,
		},
	};
}

export async function fetchServicesMaintenanceAccountOptions(): Promise<ModuleChartAccount[]> {
	const response = await ApiClient.get<ApiServicesMaintenanceAccountOptionsResponse>(
		`${ServicesMaintenanceApiPath}/account-options`,
	);

	return response.data.accounts.map((account) => ({
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
	}));
}

export async function fetchNextServiceRevenueAccountCode(): Promise<ApiServicesMaintenanceNextAccountCodeResponse> {
	const response = await ApiClient.get<ApiServicesMaintenanceNextAccountCodeResponse>(
		`${ServicesMaintenanceApiPath}/next-account-code`,
	);

	return response.data;
}

export async function createServiceMaintenance(
	values: ServicesMaintenanceFormValues,
): Promise<ServicesMaintenance> {
	const response = await ApiClient.post<ApiServicesMaintenanceSaveResponse>(
		ServicesMaintenanceApiPath,
		toApiServicePayload(values),
	);

	return mapApiService(response.data.service);
}

export async function updateServiceMaintenance(
	service: ServicesMaintenance,
): Promise<ServicesMaintenance> {
	const response = await ApiClient.patch<ApiServicesMaintenanceSaveResponse>(
		`${ServicesMaintenanceApiPath}/${service.id}`,
		toApiServicePayload(service),
	);

	return mapApiService(response.data.service);
}

export async function updateServiceMaintenanceStatus(
	service: ServicesMaintenance,
): Promise<ServicesMaintenance> {
	const response = await ApiClient.patch<ApiServicesMaintenanceSaveResponse>(
		`${ServicesMaintenanceApiPath}/${service.id}/status`,
		{ status: mapStatusToApi(service.status) },
	);

	return mapApiService(response.data.service);
}

function mapApiService(service: ApiServicesMaintenance): ServicesMaintenance {
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
		updatedAt: service.updatedAt,
	};
}

function toApiServicePayload(
	service: ServicesMaintenance | ServicesMaintenanceFormValues,
) {
	return {
		serviceName: service.serviceName.trim(),
		description: service.description.trim(),
		status: mapStatusToApi(service.status),
		accountSetupMode: mapSetupModeToApi(service.accountSetupMode),
		revenueCoaId:
			service.accountSetupMode === "Existing" ? service.revenueCoaId : null,
	};
}

function mapStatusFromApi(
	value: ApiServicesMaintenanceStatus,
): ServicesMaintenanceStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(
	value: ServicesMaintenanceStatus,
): ApiServicesMaintenanceStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapSetupModeFromApi(
	value: ApiServicesMaintenanceAccountSetupMode,
): ServicesMaintenanceAccountSetupMode {
	return value === "AUTO" ? "Auto" : "Existing";
}

function mapSetupModeToApi(
	value: ServicesMaintenanceAccountSetupMode,
): ApiServicesMaintenanceAccountSetupMode {
	return value === "Auto" ? "AUTO" : "EXISTING";
}
