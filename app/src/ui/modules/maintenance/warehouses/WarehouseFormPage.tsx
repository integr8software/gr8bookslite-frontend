"use client";

import { Warehouse } from "lucide-react";
import { useState } from "react";
import { WarehouseFormPageCopy } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { useWarehouseFormPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { WarehouseActionButtons } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseActionButtons";
import { WarehouseDetailsPanel } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseDetailsPanel";
import { WarehouseFields } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseFields";
import { WarehouseNotFound } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseNotFound";

const WarehouseFormId = "warehouse-form";

export function WarehouseFormPage() {
	const page = useWarehouseFormPage();
	const copy = WarehouseFormPageCopy[page.mode];
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: WarehouseFormId,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: page.isMutating,
		onDialogOpenChange: setIsSaveDialogOpen,
	});

	if (page.needsRecord && !page.existingWarehouse) {
		return <WarehouseNotFound />;
	}

	return (
		<>
			<form
				id={WarehouseFormId}
				onSubmit={page.handleSubmit}
				className="grid gap-5"
			>
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
							onSaveWarehouse={() => {
								if (page.validateBeforeSubmit()) {
									setIsSaveDialogOpen(true);
								}
							}}
						/>
					}
				/>

				{page.mode === "view" && page.existingWarehouse ? (
					<WarehouseDetailsPanel warehouse={page.existingWarehouse} />
				) : (
					<WarehouseFields
						errors={page.errors}
						values={page.values}
						onInputChange={page.handleInputChange}
					/>
				)}
			</form>

			<AppDialog
				confirmLabel="Confirm"
				description={
					page.mode === "edit"
						? "This will update the selected warehouse with your latest changes."
						: "This will create a new warehouse using the details you entered."
				}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title={
					page.mode === "edit"
						? "Save warehouse changes?"
						: "Save this warehouse?"
				}
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Set warehouse inactive?"
				description={`${page.existingWarehouse?.name ?? "The selected warehouse"} will remain in history and references, but will no longer be active for normal selection.`}
				confirmLabel="Set Inactive"
				tone="deactivate"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}


