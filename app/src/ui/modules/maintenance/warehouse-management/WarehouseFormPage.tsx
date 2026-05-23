"use client";

import { Warehouse } from "lucide-react";
import { WarehouseFormPageCopy } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseFormPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseAccessTable } from "./WarehouseAccessTable";
import { WarehouseActionButtons } from "./WarehouseActionButtons";
import { WarehouseDetailsPanel } from "./WarehouseDetailsPanel";
import { WarehouseFields } from "./WarehouseFields";
import { WarehouseItemsTable } from "./WarehouseItemsTable";
import { WarehouseNotFound } from "./WarehouseNotFound";
import { WarehouseTabs } from "./WarehouseTabs";

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
					<>
						<WarehouseTabs
							activeTab={page.activeTab}
							warehouse={page.existingWarehouse}
						/>
						{page.activeTab === "information" ? (
							<WarehouseDetailsPanel warehouse={page.existingWarehouse} />
						) : null}
						{page.activeTab === "access" ? (
							<WarehouseAccessTable warehouse={page.existingWarehouse} />
						) : null}
						{page.activeTab === "items" ? (
							<WarehouseItemsTable warehouse={page.existingWarehouse} />
						) : null}
					</>
				) : (
					<WarehouseFields
						errors={page.errors}
						values={page.values}
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

