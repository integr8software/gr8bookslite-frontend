"use client";

import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemSetupFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemSetupFormPage";
import type { ItemActionMode, ItemSetupKind, ItemSetupRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { ItemSetupFields } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupFields";

const formId = "item-setup-drawer-form";

export function ItemSetupDrawer({ isOpen, kind, mode, onClose, record }: { isOpen: boolean; kind: ItemSetupKind; mode: ItemActionMode; onClose: () => void; record?: ItemSetupRecord }) {
	return <ItemSetupDrawerPanel key={`${kind}-${mode}-${record?.id ?? "new"}`} isOpen={isOpen} kind={kind} mode={mode} onClose={onClose} record={record} />;
}

function ItemSetupDrawerPanel({ isOpen, kind, mode, onClose, record }: { isOpen: boolean; kind: ItemSetupKind; mode: ItemActionMode; onClose: () => void; record?: ItemSetupRecord }) {
	const page = useItemSetupFormPage(kind, { existingRecord: record, mode, onSaved: onClose });
	const config = ItemSetupConfigByKind[kind];
	return <MaintenanceFormDrawer description={config.description} eyebrow={config.eyebrow} formId={formId} isOpen={isOpen} isSaving={page.isMutating} onClose={onClose} title={`${mode === "edit" ? "Edit" : "Add"} ${config.singularTitle}`}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5"><ItemSetupFields errors={page.errors} isReadonly={false} parentKind={page.parentKind} parentOptions={page.parentOptions} values={page.values} onInputChange={page.handleInputChange} onParentIdsChange={page.handleParentIdsChange} /></form>
	</MaintenanceFormDrawer>;
}
