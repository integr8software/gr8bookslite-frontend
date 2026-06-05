"use client";

import { WarehouseFormPageCopy } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseFormPage";
import type { WarehouseActionMode, WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { WarehouseFields } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseFields";

const formId = "warehouse-drawer-form";

export function WarehouseDrawer({ isOpen, mode, onClose, warehouse }: { isOpen: boolean; mode: WarehouseActionMode; onClose: () => void; warehouse?: WarehouseRecord }) {
	return <WarehouseDrawerPanel key={`${mode}-${warehouse?.id ?? "new"}`} isOpen={isOpen} mode={mode} onClose={onClose} warehouse={warehouse} />;
}

function WarehouseDrawerPanel({ isOpen, mode, onClose, warehouse }: { isOpen: boolean; mode: WarehouseActionMode; onClose: () => void; warehouse?: WarehouseRecord }) {
	const page = useWarehouseFormPage({ existingWarehouse: warehouse, mode, onSaved: onClose });
	const copy = WarehouseFormPageCopy[mode];
	return <MaintenanceFormDrawer description={copy.description} eyebrow="Inventory maintenance" formId={formId} isOpen={isOpen} isSaving={page.isMutating} onClose={onClose} title={copy.title}>
		<form id={formId} onSubmit={page.handleSubmit} className="px-6 py-5"><WarehouseFields branchOptions={page.branchOptions} errors={page.errors} values={page.values} onAvailableBranchesChange={page.handleAvailableBranchesChange} onInputChange={page.handleInputChange} /></form>
	</MaintenanceFormDrawer>;
}
