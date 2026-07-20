"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { WarehouseStorageHref } from "@/app/src/constants/modules/maintenance/warehouse-storage/WarehouseStorageConstants";
import {
	createBlankWarehouseStorageForm,
	createStorageCodeFromForm,
	createWarehouseStorageFormFromRow,
	createWarehouseStorageRows,
	getWarehouseStorageSetup,
	upsertWarehouseStorageRecord,
} from "@/app/src/data/modules/maintenance/warehouse-storage/WarehouseStorageData";
import { createWarehouseStorageDemoWarehouses } from "@/app/src/data/modules/maintenance/warehouse-storage/WarehouseStorageMockData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import type { WarehouseStorageStatus } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";
import { validateWarehouseStorageForm } from "@/app/src/validations/modules/maintenance/warehouse-storage/WarehouseStorageValidation";

export function useWarehouseStorageFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehousesStore();
	const displayWarehouses = useMemo(() => createWarehouseStorageDemoWarehouses(warehouses), [warehouses]);
	const rows = useMemo(() => createWarehouseStorageRows(displayWarehouses), [displayWarehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<WarehouseModuleFormValues>(() =>
		needsRecord && row
			? createWarehouseStorageFormFromRow(row, displayWarehouses)
			: createBlankWarehouseStorageForm(displayWarehouses),
	);
	const selectedWarehouse = displayWarehouses.find((warehouse) => warehouse.id === form.warehouseId) ?? displayWarehouses[0];
	const storageSetup = getWarehouseStorageSetup(selectedWarehouse);
	const existingCodes = selectedWarehouse?.locations
		.filter((location) => location.id !== row?.recordId)
		.map((location) => location.locationCode) ?? [];
	const generatedStorageCode = createStorageCodeFromForm(form);

	function handleSave(nextForm: WarehouseModuleFormValues) {
		const storageCode = nextForm.locationCode.trim() || createStorageCodeFromForm(nextForm);
		const validationErrors = validateWarehouseStorageForm(
			{
				aisle: nextForm.aisle,
				binNo: nextForm.binNo,
				capacity: nextForm.capacity,
				capacityUom: nextForm.capacityUom,
				locationCode: storageCode,
				locationName: nextForm.locationName,
				locationType: nextForm.locationType,
				notes: nextForm.notes,
				rackNo: nextForm.rackNo,
				room: nextForm.room,
				shelfNo: nextForm.shelfNo,
				status: nextForm.status as WarehouseStorageStatus,
				temperatureZone: nextForm.temperatureZone,
				warehouseId: nextForm.warehouseId,
				zone: nextForm.zone,
			},
			{ existingCodes, setup: storageSetup },
		);

		if (Object.keys(validationErrors).length > 0) {
			toast.error(Object.values(validationErrors)[0] ?? "Check the warehouse storage fields.");
			return;
		}

		const nextWarehouses = upsertWarehouseStorageRecord({
			form: {
				...nextForm,
				locationCode: storageCode,
				locationName: nextForm.locationName.trim() || storageCode,
			},
			mode,
			row,
			warehouses: displayWarehouses,
		});
		const changedWarehouses = nextWarehouses.filter(
			(warehouse, index) => warehouse !== displayWarehouses[index],
		);

		changedWarehouses.forEach((changedWarehouse) => {
			if (!changedWarehouse.id.startsWith("demo-")) {
				updateWarehouse(changedWarehouse);
			}
		});

		router.push(WarehouseStorageHref);
	}

	return {
		form,
		generatedStorageCode,
		isMutating,
		isNotFound: needsRecord && !row,
		mode,
		row,
		setForm,
		storageSetup,
		selectedWarehouse,
		warehouseHref: WarehouseStorageHref,
		warehouses: displayWarehouses,
		handleSave,
	};
}

function getActionMode(pathname: string): WarehouseModuleActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
