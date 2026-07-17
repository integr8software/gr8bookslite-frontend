"use client";

import { ItemCategoryConfigDescription } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryText";
import {
	type ItemCategoryDrawerState,
	useItemCategoryFormPage,
} from "@/app/src/hooks/modules/maintenance/item-category/useItemCategoryPage";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ItemCategoryFields } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryFields";

const FormId = "item-category-drawer-form";

export function ItemCategoryDrawer({
	drawerState,
	onClose,
}: {
	drawerState: ItemCategoryDrawerState;
	onClose: () => void;
}) {
	return (
		<ItemCategoryDrawerPanel
			key={`${drawerState?.mode ?? "closed"}-${drawerState?.row?.id ?? "new"}`}
			drawerState={drawerState}
			onClose={onClose}
		/>
	);
}

function ItemCategoryDrawerPanel({
	drawerState,
	onClose,
}: {
	drawerState: ItemCategoryDrawerState;
	onClose: () => void;
}) {
	const page = useItemCategoryFormPage({
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
		<ModuleDrawer
			description={ItemCategoryConfigDescription}
			eyebrow="Item setup"
			formId={FormId}
			isOpen={Boolean(drawerState)}
			isReadonly={page.isReadonly}
			isSaving={page.isMutating}
			onBeforeSaveConfirm={page.validateBeforeSubmit}
			onClose={onClose}
			savingLabel={getModuleSavePendingLabel(page.mode)}
			title={title}
		>
			<form
				id={FormId}
				onSubmit={page.handleSubmit}
				className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
			>
				<ItemCategoryFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					parentOptions={page.parentOptions}
					values={page.values}
					onAccountingFieldChange={page.handleAccountingFieldChange}
					onAccountingModeChange={page.handleAccountingModeChange}
					onInputChange={page.handleInputChange}
					onParentChange={page.handleParentChange}
				/>
			</form>
		</ModuleDrawer>
	);
}


