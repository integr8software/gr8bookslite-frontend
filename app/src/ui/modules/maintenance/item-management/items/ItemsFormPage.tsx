"use client";

import { Package } from "lucide-react";
import { ItemsFormPageCopy } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemsFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsFormPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemActionButtons } from "./ItemActionButtons";
import { ItemBundleComponentsTable } from "./ItemBundleComponentsTable";
import { ItemFields } from "./ItemFields";
import { ItemNotFound } from "./ItemNotFound";

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
							onDeleteItem={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>

				<ItemFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>

				{page.values.supportsBundle ? (
					<ItemBundleComponentsTable
						components={page.values.bundleComponents}
						error={page.errors.bundleComponents}
						isReadonly={page.isReadonly}
						onAddComponent={page.addBundleComponent}
						onRemoveComponent={page.removeBundleComponent}
						onUpdateComponent={page.updateBundleComponent}
					/>
				) : null}
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete item?"
				description={`This will remove ${page.existingItem?.name ?? "the selected item"}.`}
				confirmLabel="Delete Item"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

