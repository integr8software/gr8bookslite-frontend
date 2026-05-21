import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

export const ResponsibilityCenterInitialFormValues: ResponsibilityCenterFormValues =
	{
		code: "",
		name: "",
		type: "Cost Center",
		manager: "",
		parentId: "",
		status: "Active",
		description: "",
	};

export const MockResponsibilityCenters: ResponsibilityCenter[] = [
	{
		id: "rc-1001",
		code: "ADM",
		name: "Administration",
		type: "Cost Center",
		manager: "Maria Santos",
		status: "Active",
		description: "Shared administrative overhead and support services.",
		createdAt: "2026-01-08T08:00:00.000Z",
		updatedAt: "2026-01-08T08:00:00.000Z",
	},
	{
		id: "rc-1002",
		code: "SALES",
		name: "Sales Operations",
		type: "Revenue Center",
		manager: "Jose Reyes",
		status: "Active",
		description: "Revenue accountability for sales teams and channels.",
		createdAt: "2026-01-10T08:00:00.000Z",
		updatedAt: "2026-01-10T08:00:00.000Z",
	},
	{
		id: "rc-1003",
		code: "WH",
		name: "Warehouse Operations",
		type: "Cost Center",
		manager: "Ana Lim",
		parentId: "rc-1001",
		status: "Active",
		description: "Inventory storage, handling, and warehouse overhead.",
		createdAt: "2026-01-12T08:00:00.000Z",
		updatedAt: "2026-01-12T08:00:00.000Z",
	},
];

export function createResponsibilityCenterFormValues(
	center: ResponsibilityCenter,
): ResponsibilityCenterFormValues {
	return {
		code: center.code,
		name: center.name,
		type: center.type,
		manager: center.manager,
		parentId: center.parentId ?? "",
		status: center.status,
		description: center.description ?? "",
	};
}

export function createResponsibilityCenterFromForm(
	values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
	const now = new Date().toISOString();

	return {
		id: `rc-${Date.now()}`,
		code: normalizeCode(values.code),
		name: values.name.trim(),
		type: values.type,
		manager: values.manager.trim(),
		parentId: optionalTrim(values.parentId),
		status: values.status,
		description: optionalTrim(values.description),
		createdAt: now,
		updatedAt: now,
	};
}

export function updateResponsibilityCenterFromForm(
	center: ResponsibilityCenter,
	values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
	return {
		...createResponsibilityCenterFromForm(values),
		id: center.id,
		createdAt: center.createdAt,
		updatedAt: new Date().toISOString(),
	};
}

function normalizeCode(value: string) {
	return value.trim().replace(/\s+/g, "-").toUpperCase();
}

function optionalTrim(value: string) {
	const trimmedValue = value.trim();

	return trimmedValue || undefined;
}
