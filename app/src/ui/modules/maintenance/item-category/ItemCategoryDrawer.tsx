"use client";

import { useState } from "react";
import { ItemCategoryDrawerDescription } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryText";
import {
	type ItemCategoryDrawerState,
	useItemCategoryFormPage,
} from "@/app/src/hooks/modules/maintenance/item-category/useItemCategoryPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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
	const [isInheritanceWarningOpen, setIsInheritanceWarningOpen] =
		useState(false);
	const title =
		page.mode === "view"
			? page.existingRecord?.name ?? "Item Category"
			: page.mode === "edit"
				? `Edit ${page.existingRecord?.name ?? "Item Category"}`
				: "Add Item Category";
	function handleBeforeSaveConfirm() {
		if (!page.validateBeforeSubmit()) {
			return false;
		}

		if (page.needsInheritanceChangeConfirmation) {
			setIsInheritanceWarningOpen(true);
			return false;
		}

		return true;
	}

	function handleConfirmInheritanceChange() {
		setIsInheritanceWarningOpen(false);
		const form = document.getElementById(FormId);

		if (form instanceof HTMLFormElement) {
			form.requestSubmit();
		}
	}

	return (
		<>
			<ModuleDrawer
				description={ItemCategoryDrawerDescription}
				eyebrow="Item setup"
				formId={FormId}
				isOpen={Boolean(drawerState)}
				isReadonly={page.isReadonly}
				isSaving={page.isMutating}
				onBeforeSaveConfirm={handleBeforeSaveConfirm}
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
						onAccountRequirementChange={page.handleAccountRequirementChange}
						onAccountingModeChange={page.handleAccountingModeChange}
						onAllowSubCategoryChange={page.handleAllowSubCategoryChange}
						onBehaviorChange={page.handleBehaviorChange}
						onInputChange={page.handleInputChange}
						onParentChange={page.handleParentChange}
						onStatusChange={page.handleStatusChange}
					/>
				</form>
			</ModuleDrawer>
			<AppDialog
				confirmLabel="Use Parent Accounts"
				description="This category and its inheriting subcategories will use the parent accounting setup for future postings. Existing transactions and account titles will remain unchanged."
				iconTone="warning"
				isOpen={isInheritanceWarningOpen}
				isPending={page.isMutating}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title="Use inherited accounting setup?"
				tone="warning"
				onCancel={() => setIsInheritanceWarningOpen(false)}
				onConfirm={handleConfirmInheritanceChange}
			/>
		</>
	);
}


