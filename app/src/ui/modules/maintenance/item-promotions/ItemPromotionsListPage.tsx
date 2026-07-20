"use client";

import Link from "next/link";
import { BadgePercent, Plus } from "lucide-react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemPromotionsHref } from "@/app/src/constants/modules/maintenance/item-promotions/ItemPromotionsConstants";
import { useItemPromotionsListPage } from "@/app/src/hooks/modules/maintenance/item-promotions/useItemPromotionsListPage";
import { ItemPromotionsStatisticCards } from "@/app/src/ui/modules/maintenance/item-promotions/ItemPromotionsStatisticCards";
import { ItemPromotionsTable } from "@/app/src/ui/modules/maintenance/item-promotions/ItemPromotionsTable";

export function ItemPromotionsListPage() {
	const page = useItemPromotionsListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Item Promotions"
				description="Maintain item-level promotions such as buy-one-take-one, bundle discounts, percentage discounts, and fixed discounts."
				eyebrow={
					<>
						<BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link
						href={`${ItemPromotionsHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Promotion
					</Link>
				}
			/>
			<ItemPromotionsStatisticCards
				activeCount={page.activeCount}
				records={page.records}
			/>
			<ItemPromotionsTable page={page} />
			<AppDialog
				isOpen={Boolean(page.pendingStatusRow)}
				isPending={page.isMutating}
				title={`Set promotion ${page.nextPendingStatus.toLowerCase()}?`}
				description={
					page.pendingStatusRow
						? `${page.pendingStatusRow.name} will be marked as ${page.nextPendingStatus}.`
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
