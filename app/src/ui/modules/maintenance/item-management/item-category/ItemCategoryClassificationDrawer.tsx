"use client";

import { ItemCategoryConfigDescription } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryClassificationText";
import {
	type ItemCategoryDrawerState,
	useItemCategoryClassificationFormPage,
} from "@/app/src/hooks/modules/maintenance/item-management/useItemCategoryClassificationPage";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { ItemCategoryClassificationFields } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryClassificationFields";

const FormId = "item-category-classification-drawer-form";

export function ItemCategoryClassificationDrawer({
	drawerState,
	onClose,
}: {
	drawerState: ItemCategoryDrawerState;
	onClose: () => void;
}) {
	return (
		<ItemCategoryClassificationDrawerPanel
			key={`${drawerState?.mode ?? "closed"}-${drawerState?.row?.id ?? "new"}`}
			drawerState={drawerState}
			onClose={onClose}
		/>
	);
}

function ItemCategoryClassificationDrawerPanel({
	drawerState,
	onClose,
}: {
	drawerState: ItemCategoryDrawerState;
	onClose: () => void;
}) {
	const page = useItemCategoryClassificationFormPage({
		mode: drawerState?.mode ?? "add",
		onSaved: onClose,
		row: drawerState?.row,
	});
	const title =
		page.mode === "view"
			? page.existingRecord?.name ?? "Item Category"
			: page.mode === "edit"
				? `Edit ${page.existingRecord?.name ?? "Item Category"}`
				: "Add Item Category";

	return (
		<MaintenanceFormDrawer
			description={ItemCategoryConfigDescription}
			eyebrow="Item setup"
			formId={FormId}
			isOpen={Boolean(drawerState)}
			isReadonly={page.isReadonly}
			isSaving={page.isMutating}
			onClose={onClose}
			title={title}
		>
			<form id={FormId} onSubmit={page.handleSubmit} className="px-6 py-5">
				<ItemCategoryClassificationFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					parentOptions={page.parentOptions}
					values={page.values}
					onAccountingFieldChange={page.handleAccountingFieldChange}
					onAccountingModeChange={page.handleAccountingModeChange}
					onInputChange={page.handleInputChange}
				/>
			</form>
		</MaintenanceFormDrawer>
	);
}
