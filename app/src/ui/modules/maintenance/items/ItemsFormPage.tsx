"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { ItemsFormPageCopy } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import { useItemsFormPage } from "@/app/src/hooks/modules/maintenance/items/useItemsFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ItemActionButtons } from "@/app/src/ui/modules/maintenance/items/ItemActionButtons";
import { ItemAttributesTable } from "@/app/src/ui/modules/maintenance/items/ItemAttributesTable";
import {
	ItemBehaviorFields,
	ItemInformationFields,
	ItemInventoryFields,
	ItemPricingTaxFields,
} from "@/app/src/ui/modules/maintenance/items/ItemFields";
import { ItemNotFound } from "@/app/src/ui/modules/maintenance/items/ItemNotFound";
import { ItemPriceListsTable } from "@/app/src/ui/modules/maintenance/items/ItemPriceListsTable";
import { ItemSuppliersTable } from "@/app/src/ui/modules/maintenance/items/ItemSuppliersTable";

const ItemsFormId = "items-form";

export function ItemsFormPage() {
	const page = useItemsFormPage();
	const copy = ItemsFormPageCopy[page.mode];
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: ItemsFormId,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: page.isMutating,
		onDialogOpenChange: setIsSaveDialogOpen,
	});

	if (page.needsRecord && !page.existingItem) {
		return <ItemNotFound />;
	}

	return (
		<>
			<form id={ItemsFormId} onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={
						page.mode === "view" && page.existingItem
							? page.existingItem.name
							: copy.title
					}
					description={copy.description}
					actionsClassName="w-full sm:w-auto sm:justify-end"
					eyebrow={
						<>
							<Package className="h-3.5 w-3.5" aria-hidden="true" />
							Item management
						</>
					}
					actions={
						<ItemActionButtons
							isReadonly={page.isReadonly}
							item={page.existingItem}
							mode={page.mode}
							nextStatus={page.existingItem ? page.nextStatus : undefined}
							onSave={() => {
								if (page.validateBeforeSubmit()) {
									setIsSaveDialogOpen(true);
								}
							}}
							onStatusChange={() => page.setIsStatusDialogOpen(true)}
						/>
					}
				/>

				<ItemInformationFields
					categoryOptions={page.categoryOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					responsibilityCenterOptions={page.responsibilityCenterOptions}
					statusOptions={page.statusOptions}
					uomOptions={page.uomOptions}
					values={page.values}
					warehouseItemsHref={page.warehouseItemsHref}
					warehouseOptions={page.warehouseOptions}
					onAddTag={page.addTag}
					onFieldChange={page.updateField}
					onInputChange={page.handleInputChange}
					onRemoveTag={page.removeTag}
				/>

				<ItemAttributesTable
					assignments={page.values.attributeAssignments}
					attributes={page.attributeRecords}
					isReadonly={page.isReadonly}
					onAddAssignment={page.addAttributeAssignment}
					onRemoveAssignment={page.removeAttributeAssignment}
					onReorderAssignment={page.reorderAttributeAssignment}
					onUpdateAssignment={page.updateAttributeAssignment}
				/>

				<ItemBehaviorFields
					categoryOptions={page.categoryOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					responsibilityCenterOptions={page.responsibilityCenterOptions}
					statusOptions={page.statusOptions}
					uomOptions={page.uomOptions}
					values={page.values}
					warehouseItemsHref={page.warehouseItemsHref}
					warehouseOptions={page.warehouseOptions}
					onAddTag={page.addTag}
					onFieldChange={page.updateField}
					onInputChange={page.handleInputChange}
					onRemoveTag={page.removeTag}
				/>

				<ItemPricingTaxFields
					categoryOptions={page.categoryOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					responsibilityCenterOptions={page.responsibilityCenterOptions}
					statusOptions={page.statusOptions}
					uomOptions={page.uomOptions}
					values={page.values}
					warehouseItemsHref={page.warehouseItemsHref}
					warehouseOptions={page.warehouseOptions}
					onAddTag={page.addTag}
					onFieldChange={page.updateField}
					onInputChange={page.handleInputChange}
					onRemoveTag={page.removeTag}
				/>

				<ItemPriceListsTable
					isReadonly={page.isReadonly}
					priceLists={page.priceLists}
					values={page.values}
					onUpdatePrice={page.updatePriceListPrice}
				/>

				<ItemInventoryFields
					categoryOptions={page.categoryOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					responsibilityCenterOptions={page.responsibilityCenterOptions}
					statusOptions={page.statusOptions}
					uomOptions={page.uomOptions}
					values={page.values}
					warehouseItemsHref={page.warehouseItemsHref}
					warehouseOptions={page.warehouseOptions}
					onAddTag={page.addTag}
					onFieldChange={page.updateField}
					onInputChange={page.handleInputChange}
					onRemoveTag={page.removeTag}
				/>

				<ItemSuppliersTable
					error={page.errors.suppliers}
					isReadonly={page.isReadonly}
					supplierOptions={page.supplierOptions}
					suppliers={page.values.suppliers}
					onAddSupplier={page.addSupplier}
					onReorderSupplier={page.reorderSupplier}
					onRemoveSupplier={page.removeSupplier}
					onUpdateSupplier={page.updateSupplier}
				/>
			</form>

			<AppDialog
				confirmLabel="Confirm"
				description={
					page.mode === "edit"
						? "This will update the selected item with your latest changes."
						: "This will create a new item using the details you entered."
				}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title={page.mode === "edit" ? "Save item changes?" : "Save this item?"}
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>

			<AppDialog
				isOpen={page.isStatusDialogOpen}
				isPending={page.isMutating}
				title={
					page.nextStatus === "Inactive"
						? "Set item inactive?"
						: "Reactivate item?"
				}
				description={`This will mark ${page.existingItem?.name ?? "the selected item"} as ${page.nextStatus.toLowerCase()}.`}
				confirmLabel={
					page.nextStatus === "Inactive" ? "Set Inactive" : "Reactivate"
				}
				tone={page.nextStatus === "Inactive" ? "deactivate" : "activate"}
				onCancel={() => page.setIsStatusDialogOpen(false)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</>
	);
}


