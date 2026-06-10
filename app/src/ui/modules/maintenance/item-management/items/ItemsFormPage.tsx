"use client";

import { Package } from "lucide-react";
import { ItemsFormPageCopy } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemsFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemActionButtons } from "@/app/src/ui/modules/maintenance/item-management/items/ItemActionButtons";
import { ItemBundleComponentsTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemBundleComponentsTable";
import { ItemFields } from "@/app/src/ui/modules/maintenance/item-management/items/ItemFields";
import { ItemNotFound } from "@/app/src/ui/modules/maintenance/item-management/items/ItemNotFound";
import { ItemSuppliersTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemSuppliersTable";
import { ItemUomConversionsTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemUomConversionsTable";

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

				<ItemFields
					categoryOptions={page.categoryOptions}
					errors={page.errors}
					isReadonly={page.isReadonly}
					statusOptions={page.statusOptions}
					subcategoryOptions={page.subcategoryOptions}
					subtypeOptions={page.subtypeOptions}
					typeOptions={page.typeOptions}
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

				{!page.values.supportsBundle ? (
					<ItemUomConversionsTable
						conversions={page.values.uomConversions}
						isReadonly={page.isReadonly}
						onAddConversion={page.addUomConversion}
						onRemoveConversion={page.removeUomConversion}
						onUpdateConversion={page.updateUomConversion}
					/>
				) : null}

				{page.values.supportsBundle ? (
					<ItemBundleComponentsTable
						components={page.values.bundleComponents}
						error={page.errors.bundleComponents}
						isReadonly={page.isReadonly}
						itemOptions={page.bundleComponentItemOptions}
						onAddComponent={page.addBundleComponent}
						onReorderComponent={page.reorderBundleComponent}
						onRemoveComponent={page.removeBundleComponent}
						onUpdateComponent={page.updateBundleComponent}
					/>
				) : null}
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
