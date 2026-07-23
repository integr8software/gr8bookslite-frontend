"use client";

import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemBundlesHref } from "@/app/src/constants/modules/item-management/item-bundles/ItemBundlesConstants";
import { useItemBundlesListPage } from "@/app/src/hooks/modules/item-management/item-bundles/useItemBundlesListPage";
import { ItemBundlesStatisticCards } from "@/app/src/ui/modules/item-management/item-bundles/ItemBundlesStatisticCards";
import { ItemBundlesTable } from "@/app/src/ui/modules/item-management/item-bundles/ItemBundlesTable";

export function ItemBundlesListPage() {
	const page = useItemBundlesListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Item Bundles"
				description="Maintain grouped sales items with component items, quantities, bundle price, and status."
				eyebrow={
					<>
						<Layers className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link
						href={`${ItemBundlesHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Bundle
					</Link>
				}
			/>
			<ItemBundlesStatisticCards
				activeCount={page.activeCount}
				records={page.records}
			/>
			<ItemBundlesTable page={page} />
			<AppDialog
				isOpen={Boolean(page.pendingStatusRow)}
				isPending={page.isMutating}
				title={`Set bundle ${page.nextPendingStatus.toLowerCase()}?`}
				description={
					page.pendingStatusRow
						? `${page.pendingStatusRow.bundleItem} will be marked as ${page.nextPendingStatus}.`
						: ""
				}
				confirmLabel={`Set ${page.nextPendingStatus}`}
				tone={
					page.nextPendingStatus === "Inactive" ? "deactivate" : "activate"
				}
				onCancel={() => page.setPendingStatusRow(null)}
				onConfirm={page.confirmStatusChange}
			/>
		</section>
	);
}
