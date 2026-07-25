"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createServiceMaintenance,
	fetchNextServiceRevenueAccountCode,
	fetchServicesMaintenance,
	fetchServicesMaintenanceAccountOptions,
	updateServiceMaintenance,
	updateServiceMaintenanceStatus,
} from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceApi";
import { ServicesMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceQueryKeys";
import type {
	ApiServicesMaintenanceNextAccountCodeResponse,
	ServicesMaintenance,
	ServicesMaintenanceFormValues,
	ServicesMaintenancePermissions,
	ServicesMaintenanceStatistics,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";

type ServicesMaintenanceStoreState = {
	accountOptions: ModuleChartAccount[];
	addService: (service: ServicesMaintenanceFormValues) => Promise<ServicesMaintenance>;
	isAccountOptionsLoading: boolean;
	isLoading: boolean;
	isMutating: boolean;
	isNextAccountCodeLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	nextAccountCode: ApiServicesMaintenanceNextAccountCodeResponse | null;
	permissions: ServicesMaintenancePermissions;
	refreshServices: () => void;
	refreshSetup: () => void;
	services: ServicesMaintenance[];
	statistics: ServicesMaintenanceStatistics;
	updateService: (service: ServicesMaintenance) => Promise<ServicesMaintenance>;
	updateServiceStatus: (service: ServicesMaintenance) => Promise<ServicesMaintenance>;
};

const EmptyPermissions: ServicesMaintenancePermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRolePermissions: ServicesMaintenancePermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyStatistics: ServicesMaintenanceStatistics = {
	totalServices: 0,
	activeServices: 0,
	inactiveServices: 0,
	accountTitles: 0,
};

export function useServicesMaintenanceStore<TSelected = ServicesMaintenanceStoreState>(
	selector?: (state: ServicesMaintenanceStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const companyId = authProfileQuery.data?.activeCompanyId ?? null;
	const servicesQuery = useQuery({
		queryKey: ServicesMaintenanceQueryKeys.services(companyId),
		queryFn: fetchServicesMaintenance,
		enabled: Boolean(companyId),
		retry: false,
	});
	const accountOptionsQuery = useQuery({
		queryKey: ServicesMaintenanceQueryKeys.accountOptions(companyId),
		queryFn: fetchServicesMaintenanceAccountOptions,
		enabled: Boolean(companyId),
		retry: false,
	});
	const nextAccountCodeQuery = useQuery({
		queryKey: ServicesMaintenanceQueryKeys.nextAccountCode(companyId),
		queryFn: fetchNextServiceRevenueAccountCode,
		enabled: Boolean(companyId),
		retry: false,
	});
	const refreshServices = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ServicesMaintenanceQueryKeys.services(companyId),
		});
	}, [companyId, queryClient]);
	const refreshSetup = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ServicesMaintenanceQueryKeys.all(companyId),
		});
	}, [companyId, queryClient]);

	const addServiceMutation = useMutation({
		mutationFn: createServiceMaintenance,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ServicesMaintenanceQueryKeys.all(companyId),
			});
			toast.success("Service created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create service. Please try again.",
			);
		},
	});
	const updateServiceMutation = useMutation({
		mutationFn: updateServiceMaintenance,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ServicesMaintenanceQueryKeys.all(companyId),
			});
			toast.success("Service updated successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update service. Please try again.",
			);
		},
	});
	const updateServiceStatusMutation = useMutation({
		mutationFn: updateServiceMaintenanceStatus,
		onSuccess: (_, updatedService) => {
			void queryClient.invalidateQueries({
				queryKey: ServicesMaintenanceQueryKeys.all(companyId),
			});
			toast.success(
				`Service ${updatedService.status === "Active" ? "activated" : "inactivated"} successfully.`,
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update service status. Please try again.",
			);
		},
	});

	const state = useMemo<ServicesMaintenanceStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			accountOptions: accountOptionsQuery.data ?? [],
			addService: (service) => addServiceMutation.mutateAsync(service),
			isAccountOptionsLoading: accountOptionsQuery.isFetching,
			isLoading: servicesQuery.isLoading,
			isMutating:
				addServiceMutation.isPending ||
				updateServiceMutation.isPending ||
				updateServiceStatusMutation.isPending,
			isNextAccountCodeLoading: nextAccountCodeQuery.isFetching,
			isRefreshing: servicesQuery.isFetching && !servicesQuery.isLoading,
			lastSyncedAt: servicesQuery.dataUpdatedAt,
			nextAccountCode: nextAccountCodeQuery.data ?? null,
			permissions: hasReservedRoleAccess
				? ReservedRolePermissions
				: (servicesQuery.data?.permissions ?? EmptyPermissions),
			refreshServices,
			refreshSetup,
			services: servicesQuery.data?.services ?? [],
			statistics: servicesQuery.data?.statistics ?? EmptyStatistics,
			updateService: (service) => updateServiceMutation.mutateAsync(service),
			updateServiceStatus: (service) =>
				updateServiceStatusMutation.mutateAsync(service),
		};
	}, [
		accountOptionsQuery.data,
		accountOptionsQuery.isFetching,
		addServiceMutation,
		authProfileQuery.data,
		nextAccountCodeQuery.data,
		nextAccountCodeQuery.isFetching,
		refreshServices,
		refreshSetup,
		servicesQuery.data,
		servicesQuery.dataUpdatedAt,
		servicesQuery.isFetching,
		servicesQuery.isLoading,
		updateServiceMutation,
		updateServiceStatusMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}
