import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export type MaterialRequestItemColumnId = Exclude<keyof MaterialRequestItem, "id">;

export type MaterialRequestItemValidationMessages = Partial<
	Record<MaterialRequestItemColumnId, string>
>;

export type MaterialRequestItemValidationResult = {
	errors: string[];
	fieldErrors: MaterialRequestItemValidationMessages;
};

export type MaterialRequestImportPreviewRow = {
	errors: string[];
	fieldErrors: MaterialRequestItemValidationMessages;
	id: string;
	item: MaterialRequestItem;
};

export type MaterialRequestItemsTableProps = {
	error?: string;
	isReadonly: boolean;
	items: MaterialRequestItem[];
	onAddItems: (count: number) => void;
	onClearItem: (itemId: string) => void;
	onClearItems: (action: ModuleDataEntryClearAction) => void;
	onDuplicateItem: (itemId: string) => void;
	onImportItems: (items: MaterialRequestItem[]) => void;
	onInsertItem: (itemId: string, position: "above" | "below") => void;
	onMoveItem: (fromItemId: string, toItemId: string) => void;
	onPasteItemCells: (
		startItemId: string,
		updates: Partial<MaterialRequestItem>[],
	) => void;
	onRemoveItem: (itemId: string) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) => void;
};
