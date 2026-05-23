"use client";

import { Tags } from "lucide-react";
import { useItemSetupFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemSetupFormPage";
import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemSetupActionButtons } from "./ItemSetupActionButtons";
import { ItemSetupFields } from "./ItemSetupFields";
import { ItemSetupNotFound } from "./ItemSetupNotFound";

export function ItemSetupFormPage({ kind }: { kind: ItemSetupKind }) {
	const page = useItemSetupFormPage(kind);
	const title =
		page.mode === "add"
			? `Add ${page.config.singularTitle}`
			: page.mode === "edit"
				? `Edit ${page.config.singularTitle}`
				: page.existingRecord?.name ?? page.config.singularTitle;

	if (page.needsRecord && !page.existingRecord) {
		return (
			<ItemSetupNotFound
				href={page.config.href}
				title={page.config.singularTitle}
			/>
		);
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={title}
					description={page.config.description}
					eyebrow={
						<>
							<Tags className="h-3.5 w-3.5" aria-hidden="true" />
							{page.config.eyebrow}
						</>
					}
					actions={
						<ItemSetupActionButtons
							href={page.config.href}
							isReadonly={page.isReadonly}
							mode={page.mode}
							record={page.existingRecord}
							onDeleteRecord={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>

				<ItemSetupFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>

			<AppDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title={`Delete ${page.config.singularTitle.toLowerCase()}?`}
				description={`This will remove ${page.existingRecord?.name ?? "the selected record"}.`}
				confirmLabel="Delete Record"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

