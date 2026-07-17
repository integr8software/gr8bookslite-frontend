"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { WarehouseTransfersHref } from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import {
	createBlankWarehouseTransferForm,
	createWarehouseTransferFormFromRow,
	createWarehouseTransferRows,
	upsertWarehouseTransferRecord,
} from "@/app/src/data/modules/maintenance/warehouse-transfers/WarehouseTransferData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useWarehouseTransferFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehousesStore();
	const rows = useMemo(() => createWarehouseTransferRows(warehouses), [warehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<WarehouseModuleFormValues>(() =>
		needsRecord && row
			? createWarehouseTransferFormFromRow(row, warehouses)
			: createBlankWarehouseTransferForm(warehouses),
	);

	function handleSave(nextForm: WarehouseModuleFormValues) {
		const nextWarehouses = upsertWarehouseTransferRecord({
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
