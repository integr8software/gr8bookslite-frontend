"use client";

import { Warehouse } from "lucide-react";
import { WarehouseFormPageCopy } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseActionButtons } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseActionButtons";
import { WarehouseDetailsPanel } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseDetailsPanel";
import { WarehouseFields } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseFields";
import { WarehouseNotFound } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseNotFound";

export function WarehouseFormPage() {
	const page = useWarehouseFormPage();
	const copy = WarehouseFormPageCopy[page.mode];

	if (page.needsRecord && !page.existingWarehouse) {
		return <WarehouseNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={
						page.mode === "view" && page.existingWarehouse
							? page.existingWarehouse.name
							: copy.title
					}
					description={copy.description}
					eyebrow={
						<>
							<Warehouse className="h-3.5 w-3.5" aria-hidden="true" />
							Inventory maintenance
						</>
					}
					actions={
						<WarehouseActionButtons
							isReadonly={page.isReadonly}
							mode={page.mode}
							warehouse={page.existingWarehouse}
							onDeleteWarehouse={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>

				{page.mode === "view" && page.existingWarehouse ? (
					<WarehouseDetailsPanel warehouse={page.existingWarehouse} />
				) : (
					<WarehouseFields
						availabilityOptions={page.availabilityOptions}
						branchOptions={page.branchOptions}
						errors={page.errors}
						values={page.values}
						onAvailableBranchesChange={page.handleAvailableBranchesChange}
						onFieldChange={page.updateField}
						onInputChange={page.handleInputChange}
					/>
				)}
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete warehouse?"
				description={`This will remove ${page.existingWarehouse?.name ?? "the selected warehouse"}.`}
				confirmLabel="Delete Warehouse"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}
