"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { StorageLocationsHref } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import {
	createBlankStorageLocationForm,
	createStorageLocationFormFromRow,
	createStorageLocationRows,
	upsertStorageLocationRecord,
} from "@/app/src/data/modules/maintenance/storage-locations/StorageLocationData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useStorageLocationFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehousesStore();
	const rows = useMemo(() => createStorageLocationRows(warehouses), [warehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<WarehouseModuleFormValues>(() =>
		needsRecord && row
			? createStorageLocationFormFromRow(row, warehouses)
			: createBlankStorageLocationForm(warehouses),
	);

	function handleSave(nextForm: WarehouseModuleFormValues) {
		const nextWarehouses = upsertStorageLocationRecord({
			form: nextForm,
			mode,
			row,
			warehouses,
		});
		const changedWarehouses = nextWarehouses.filter(
			(warehouse, index) => warehouse !== warehouses[index],
		);

		changedWarehouses.forEach((changedWarehouse) => {
			updateWarehouse(changedWarehouse);
		});

		router.push(StorageLocationsHref);
	}

	return {
		form,
		isMutating,
		isNotFound: needsRecord && !row,
		mode,
		row,
		setForm,
		warehouseHref: StorageLocationsHref,
		warehouses,
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
