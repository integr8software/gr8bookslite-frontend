"use client";

import { ArrowLeft, Edit3, Save, Tags, X } from "lucide-react";
import Link from "next/link";
import { ItemCategoryHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemCategoryClassificationFormPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemCategoryClassificationPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemSetupNotFound } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupNotFound";
import { ItemCategoryClassificationFields } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryClassificationFields";
import { ItemCategoryConfigDescription } from "@/app/src/ui/modules/maintenance/item-management/item-category/ItemCategoryClassificationText";

export function ItemCategoryClassificationFormPage() {
	const page = useItemCategoryClassificationFormPage();
	const title =
		page.mode === "add"
			? "Add Item Category"
			: page.mode === "edit"
				? `Edit ${page.existingRecord?.name ?? "Item Category"}`
				: page.existingRecord?.name ?? "Item Category";

	if (page.needsRecord && !page.existingRecord) {
		return <ItemSetupNotFound href={ItemCategoryHref} title="Item Category" />;
	}

	return (
		<form onSubmit={page.handleSubmit} className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description={ItemCategoryConfigDescription}
				eyebrow={
					<>
						<Tags className="h-3.5 w-3.5" aria-hidden="true" />
						Item setup
					</>
				}
				actions={
					<>
						<Link href={ItemCategoryHref} className={moduleHeaderActionClassNames.secondary}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{page.mode === "view" && page.existingRecord ? (
							<Link
								href={`${ItemCategoryHref}/edit/${page.existingRecord.id}`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{page.mode === "edit" && page.existingRecord ? (
							<Link
								href={`${ItemCategoryHref}/view/${page.existingRecord.id}`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Cancel
							</Link>
						) : null}
						{page.isReadonly ? null : (
							<button
								type="submit"
								disabled={page.isMutating}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								{page.isMutating ? "Saving..." : "Save"}
							</button>
						)}
					</>
				}
			/>
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
	);
}
