"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	WarehouseBranchOptions,
	WarehouseManagementHref,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import {
	WarehouseInitialFormValues,
	createWarehouseFormValues,
	createWarehouseRecord,
	updateWarehouseRecord,
} from "@/app/src/data/modules/maintenance/warehouse-management/WarehouseManagementData";
import type {
	WarehouseActionMode,
	WarehouseRecord,
	WarehouseFormErrors,
	WarehouseFormValues,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { validateWarehouseForm } from "@/app/src/validations/modules/maintenance/warehouse-management/WarehouseManagementValidation";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";

type WarehouseFormPageOptions = {
	existingWarehouse?: WarehouseRecord;
	mode?: WarehouseActionMode;
	onSaved?: () => void;
};

export function useWarehouseFormPage(options: WarehouseFormPageOptions = {}) {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const {
		addWarehouse,
		deleteWarehouse,
		isMutating,
		updateWarehouse,
		warehouses,
	} = useWarehouseManagementStore();
	const mode = options.mode ?? getActionMode(pathname);
	const existingWarehouse = options.existingWarehouse ?? warehouses.find(
		(warehouse) => warehouse.id === params.recordId,
	);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<WarehouseFormValues>(() =>
		existingWarehouse
			? createWarehouseFormValues(existingWarehouse)
			: WarehouseInitialFormValues,
	);
	const [errors, setErrors] = useState<WarehouseFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function updateField(
		field: keyof WarehouseFormValues,
		value: WarehouseFormValues[keyof WarehouseFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			return { ...current, [field]: value };
		});
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		updateField(
			event.target.name as keyof WarehouseFormValues,
			event.target.value,
		);
	}

	function handleAvailableBranchesChange(value: string | string[]) {
		updateField(
			"availableBranches",
			Array.isArray(value) ? value : value ? [value] : [],
		);
	}

	function validateBeforeSubmit() {
		const nextErrors = validateWarehouseForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			toast.error("Please fix the highlighted warehouse fields.");
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validateBeforeSubmit()) {
			return;
		}

		if (mode === "edit" && existingWarehouse) {
			updateWarehouse(updateWarehouseRecord(existingWarehouse, values));
			options.onSaved?.();
			if (!options.onSaved) {
				router.push(`${WarehouseManagementHref}/view/${existingWarehouse.id}`);
			}
			return;
		}

		if (mode === "edit") {
			toast.error("Could not find the warehouse to update.");
			return;
		}

		addWarehouse(createWarehouseRecord(values));
		options.onSaved?.();
		if (!options.onSaved) router.push(WarehouseManagementHref);
	}

	function handleConfirmDelete() {
		if (!existingWarehouse) {
			toast.error("Could not find the warehouse to delete.");
			return;
		}

		deleteWarehouse(existingWarehouse.id);
		setIsDeleteDialogOpen(false);
		router.push(WarehouseManagementHref);
	}

	return {
		branchOptions: WarehouseBranchOptions,
		errors,
		existingWarehouse,
		handleAvailableBranchesChange,
		handleConfirmDelete,
		handleInputChange,
		handleSubmit,
		isDeleteDialogOpen,
		isMutating,
		isReadonly,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		setIsDeleteDialogOpen,
		validateBeforeSubmit,
		values,
	};
}

function getActionMode(pathname: string): WarehouseActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
