"use client";

import type { ComponentProps } from "react";
import type { MaterialRequestItem } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import { MaterialRequestItemImportDialog } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemImportDialog";

type MaterialRequestItemsTableViewProps = {
	importDialogProps: ComponentProps<typeof MaterialRequestItemImportDialog>;
	moduleDataEntryProps: ComponentProps<typeof ModuleDataEntry<MaterialRequestItem>>;
	remarksDialogProps: ComponentProps<typeof ModuleTextareaDialog>;
};

export function MaterialRequestItemsTable({
	importDialogProps,
	moduleDataEntryProps,
	remarksDialogProps,
}: MaterialRequestItemsTableViewProps) {
	return (
		<>
			<ModuleDataEntry {...moduleDataEntryProps} />
			<MaterialRequestItemImportDialog {...importDialogProps} />
			<ModuleTextareaDialog {...remarksDialogProps} />
		</>
	);
}
