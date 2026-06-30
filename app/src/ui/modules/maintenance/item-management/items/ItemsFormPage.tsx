"use client";

import { Package } from "lucide-react";
import { ItemsFormPageCopy } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemsFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemActionButtons } from "@/app/src/ui/modules/maintenance/item-management/items/ItemActionButtons";
import { ItemAttributesTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemAttributesTable";
import {
	ItemBehaviorFields,
	ItemInformationFields,
	ItemInventoryFields,
	ItemPricingTaxFields,
} from "@/app/src/ui/modules/maintenance/item-management/items/ItemFields";
import { ItemNotFound } from "@/app/src/ui/modules/maintenance/item-management/items/ItemNotFound";
import { ItemPriceListsTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemPriceListsTable";
import { ItemSuppliersTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemSuppliersTable";

export function ItemsFormPage() {
	const page = useItemsFormPage();
	const copy = ItemsFormPageCopy[page.mode];

	if (page.needsRecord && !page.existingItem) {
		return <ItemNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
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
				tone={page.nextStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => page.setIsStatusDialogOpen(false)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</>
	);
}
