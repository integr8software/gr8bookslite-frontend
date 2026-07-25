"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useServicesMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenance";
import type {
	ServicesMaintenance,
	ServicesMaintenanceStatusFilter,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

export function useServicesMaintenanceListPage() {
	const {
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		permissions,
		refreshServices,
		services,
		statistics,
		updateServiceStatus,
	} = useServicesMaintenanceStore();
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<ServicesMaintenanceStatusFilter>("");
	const [pendingStatusService, setPendingStatusService] =
		useState<ServicesMaintenance | null>(null);
	const filteredServices = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return services.filter((service) => {
			if (statusFilter && service.status !== statusFilter) return false;
			if (!normalizedQuery) return true;

			return [
				service.serviceName,
				service.description,
				service.revenueAccountCode,
				service.revenueAccountTitle,
				service.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [query, services, statusFilter]);

	function confirmServiceStatusChange() {
		if (!pendingStatusService) return;

		return updateServiceStatus({
			...pendingStatusService,
			status: pendingStatusService.status === "Active" ? "Inactive" : "Active",
		})
			.then(() => setPendingStatusService(null))
			.catch(() => undefined);
	}

	return {
		confirmServiceStatusChange,
		filteredServices,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingStatusService,
		permissions,
		query,
		refreshServices,
		services,
		setPendingStatusService,
		setQuery,
		setStatusFilter: setStatusFilter as (
			value: ServicesMaintenanceStatusFilter,
		) => void,
		statistics,
		statusFilter,
	};
}
