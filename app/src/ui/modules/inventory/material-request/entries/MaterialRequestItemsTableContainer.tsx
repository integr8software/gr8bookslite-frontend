"use client";

import { useMaterialRequestItemsTable } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestItemsTable";
import type { MaterialRequestItemsTableProps } from "@/app/src/types/modules/inventory/material-request/MaterialRequestItemEntryTypes";
import { MaterialRequestItemsTable } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemsTable";

export function MaterialRequestItemsTableContainer(
	props: MaterialRequestItemsTableProps,
) {
	const tableProps = useMaterialRequestItemsTable(props);

	return <MaterialRequestItemsTable {...tableProps} />;
}
