"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	WarehouseManagementHref,
	createWarehouseAccessHref,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseAccessFormErrors,
	WarehouseAccessPermission,
	WarehouseAccessRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { validateWarehouseAccess } from "@/app/src/validations/modules/maintenance/warehouse-management/WarehouseManagementValidation";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";

export function useWarehouseAccessPage() {
	const params = useParams<{ recordId?: string }>();
	const router = useRouter();
	const { isMutating, updateWarehouse, warehouses } =
		useWarehouseManagementStore();
	const warehouse = warehouses.find(
		(currentWarehouse) => currentWarehouse.id === params.recordId,
	);
	const [accessRecords, setAccessRecords] = useState<WarehouseAccessRecord[]>(
		() => warehouse?.access ?? [],
	);
	const [errors, setErrors] = useState<WarehouseAccessFormErrors>({});

	function addAccess() {
		setAccessRecords((current) => [
			...current,
			{
				id: `access-${Date.now()}`,
				userName: "",
				role: "",
				accessLevel: "Viewer",
				permissions: ["View Stock"],
				status: "Active",
			},
		]);
	}

	function updateAccess<TKey extends keyof WarehouseAccessRecord>(
		accessId: string,
		field: TKey,
		value: WarehouseAccessRecord[TKey],
	) {
		setAccessRecords((current) =>
			current.map((access) =>
				access.id === accessId ? { ...access, [field]: value } : access,
			),
		);
		setErrors((current) => ({
			...current,
			[accessId]: {
				...current[accessId],
				[field]: undefined,
			},
		}));
	}

	function togglePermission(
		accessId: string,
		permission: WarehouseAccessPermission,
	) {
		setAccessRecords((current) =>
			current.map((access) => {
				if (access.id !== accessId) {
					return access;
				}

				const hasPermission = access.permissions.includes(permission);

				return {
					...access,
					permissions: hasPermission
						? access.permissions.filter(
								(currentPermission) => currentPermission !== permission,
							)
						: [...access.permissions, permission],
				};
			}),
		);
		setErrors((current) => ({
			...current,
			[accessId]: {
				...current[accessId],
				permissions: undefined,
			},
		}));
	}

	function removeAccess(accessId: string) {
		setAccessRecords((current) =>
			current.filter((access) => access.id !== accessId),
		);
		setErrors((current) => {
			const nextErrors = { ...current };
			delete nextErrors[accessId];
			return nextErrors;
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!warehouse) {
			toast.error("Could not find the warehouse to update.");
			return;
		}

		const nextErrors = validateWarehouseAccess(accessRecords);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted warehouse access rows.");
			return;
		}

		updateWarehouse({ ...warehouse, access: accessRecords });
		router.push(createWarehouseAccessHref(warehouse.id));
	}

	return {
		accessRecords,
		addAccess,
		errors,
		handleSubmit,
		isMutating,
		removeAccess,
		togglePermission,
		updateAccess,
		warehouse,
		warehouseHref: warehouse
			? `${WarehouseManagementHref}/view/${warehouse.id}`
			: WarehouseManagementHref,
	};
}
