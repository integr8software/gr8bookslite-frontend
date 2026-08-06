"use client";

import type { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import { MaterialRequestItemsTable } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemsTable";

type MaterialRequestActionPageState = ReturnType<typeof useMaterialRequestFormPage>;

export function MaterialRequestEntrySection({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	return (
		<MaterialRequestItemsTable
			error={page.errors.items}
			isReadonly={page.isReadonly}
			items={page.values.items}
			onAddItems={page.addItems}
			onClearItem={page.clearItem}
			onClearItems={page.clearItems}
			onDuplicateItem={page.duplicateItem}
			onImportItems={page.importItems}
			onInsertItem={page.insertItem}
			onMoveItem={page.moveItem}
			onPasteItemCells={page.pasteItemCells}
			onRemoveItem={page.removeItem}
			onUpdateItem={page.updateItem}
		/>
	);
}
