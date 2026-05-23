"use client";

import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";
import { ItemsHref } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemsListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemsTable } from "./ItemsTable";

export function ItemsListPage() {
	const page = useItemsListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Items"
				description="Maintain item master records, classifications, and bundle component definitions."
				eyebrow={
					<>
						<Package className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link
						href={`${ItemsHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Item
					</Link>
				}
			/>

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
				<label className="relative block">
					<span className="sr-only">Search items</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						value={page.query}
						onChange={(event) => page.handleQueryChange(event.target.value)}
						placeholder="Search by item, code, category, type, or status"
						className="h-12 w-full rounded-lg border border-darknavy/10 bg-offwhite/65 pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
			</div>

			<ItemsTable
				isLoading={page.isLoading}
				setPendingDeleteItem={page.setPendingDeleteItem}
				table={page.table}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDeleteItem)}
				isPending={page.isMutating}
				title="Delete item?"
				description={`This will remove ${page.pendingDeleteItem?.name ?? "the selected item"}.`}
				confirmLabel="Delete Item"
				tone="danger"
				onCancel={() => page.setPendingDeleteItem(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}

