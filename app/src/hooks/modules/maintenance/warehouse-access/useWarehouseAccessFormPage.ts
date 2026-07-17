"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { WarehouseAccessHref } from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import {
	createBlankWarehouseAccessForm,
	createWarehouseAccessFormFromRow,
	createWarehouseAccessRows,
	upsertWarehouseAccessRecord,
} from "@/app/src/data/modules/maintenance/warehouse-access/WarehouseAccessData";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function useWarehouseAccessFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehousesStore();
	const rows = useMemo(() => createWarehouseAccessRows(warehouses), [warehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<WarehouseModuleFormValues>(() =>
		needsRecord && row
			? createWarehouseAccessFormFromRow(row, warehouses)
			: createBlankWarehouseAccessForm(warehouses),
	);

	function handleSave(nextForm: WarehouseModuleFormValues) {
		const nextWarehouses = upsertWarehouseAccessRecord({
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

		router.push(WarehouseAccessHref);
	}

	return {
		form,
		isMutating,
		isNotFound: needsRecord && !row,
		mode,
		row,
		setForm,
		warehouseHref: WarehouseAccessHref,
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
