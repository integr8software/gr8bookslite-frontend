"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { WarehouseTransfersHref } from "@/app/src/constants/modules/warehouse-management/warehouse-transfers/WarehouseTransferConstants";
import {
	createBlankWarehouseTransferForm,
	createWarehouseTransferFormFromRow,
	createWarehouseTransferRows,
	upsertWarehouseTransferRecord,
} from "@/app/src/data/modules/warehouse-management/warehouse-transfers/WarehouseTransferData";
import { createWarehouseStorageDemoWarehouses } from "@/app/src/data/modules/warehouse-management/warehouse-storage/WarehouseStorageMockData";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function useWarehouseTransferFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehousesStore();
	const displayWarehouses = useMemo(() => createWarehouseStorageDemoWarehouses(warehouses), [warehouses]);
	const rows = useMemo(() => createWarehouseTransferRows(displayWarehouses), [displayWarehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<WarehouseModuleFormValues>(() =>
		needsRecord && row
			? createWarehouseTransferFormFromRow(row, displayWarehouses)
			: createBlankWarehouseTransferForm(displayWarehouses),
	);

	function handleSave(nextForm: WarehouseModuleFormValues) {
		const nextWarehouses = upsertWarehouseTransferRecord({
			form: nextForm,
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

		router.push(WarehouseTransfersHref);
	}

	return {
		form,
		isMutating,
		isNotFound: needsRecord && !row,
		mode,
		row,
		setForm,
		warehouseHref: WarehouseTransfersHref,
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
