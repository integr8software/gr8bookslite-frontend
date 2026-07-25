import type {
	ServicesMaintenance,
	ServicesMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

export const ServicesMaintenanceInitialFormValues: ServicesMaintenanceFormValues = {
	serviceName: "",
	description: "",
	status: "Active",
	accountSetupMode: "Auto",
	revenueCoaId: "",
};

export function createServicesMaintenanceFormValues(
	service: ServicesMaintenance,
): ServicesMaintenanceFormValues {
	return {
		serviceName: service.serviceName,
		description: service.description,
		status: service.status,
		accountSetupMode: service.accountSetupMode,
		revenueCoaId: service.accountSetupMode === "Existing" ? service.revenueCoaId : "",
	};
}

export function updateServicesMaintenanceFromForm(
	service: ServicesMaintenance,
	values: ServicesMaintenanceFormValues,
): ServicesMaintenance {
	return {
		...service,
		...values,
		serviceName: values.serviceName.trim(),
		description: values.description.trim(),
		revenueAccountTitle:
			values.accountSetupMode === "Auto"
				? buildGeneratedServiceRevenueAccountTitle(values.serviceName)
				: service.revenueAccountTitle,
	};
}

export function buildGeneratedServiceRevenueAccountTitle(serviceName: string) {
	return `${serviceName.trim()}`;
}

export function getServicesMaintenanceTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 9) return "min-w-[126rem]";
	if (visibleColumnCount >= 8) return "min-w-[112rem]";
	if (visibleColumnCount >= 7) return "min-w-[98rem]";
	if (visibleColumnCount >= 6) return "min-w-[84rem]";
	return "min-w-[68rem]";
}
