"use client";

import Link from "next/link";
import { MoveRight, Plus } from "lucide-react";
import {
	WarehouseTransfersActionLabel,
	WarehouseTransfersDescription,
	WarehouseTransfersHref,
	WarehouseTransfersTitle,
} from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import { useWarehouseTransfersListPage } from "@/app/src/hooks/modules/maintenance/warehouse-transfers/useWarehouseTransfersListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseTransferStatisticCards } from "@/app/src/ui/modules/maintenance/warehouse-transfers/WarehouseTransferStatisticCards";
import { WarehouseTransferTable } from "@/app/src/ui/modules/maintenance/warehouse-transfers/WarehouseTransferTable";

export function WarehouseTransfersListPage() {
	const page = useWarehouseTransfersListPage();
	const hasActiveFilters =
		page.query.trim().length > 0 || page.statusFilter !== "All";

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={WarehouseTransfersTitle}
				description={WarehouseTransfersDescription}
				eyebrow={
					<>
						<MoveRight className="h-3.5 w-3.5" aria-hidden="true" />
						Warehouse management
					</>
				}
				actions={
					<Link
						href={`${WarehouseTransfersHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{WarehouseTransfersActionLabel}
					</Link>
				}
			/>
			<WarehouseTransferStatisticCards
				isLoading={page.isLoading}
				records={page.records}
				statistics={page.statistics}
			/>
			<WarehouseTransferTable page={page} hasActiveFilters={hasActiveFilters} />
			<AppDialog
				isOpen={Boolean(page.pendingDelete)}
				isPending={page.isMutating}
				title="Remove warehouse transfer?"
				description="This will remove the selected transfer from the current data set."
				confirmLabel="Remove"
				tone="danger"
				onCancel={() => page.setPendingDelete(null)}
				onConfirm={page.confirmDelete}
			/>
		</section>
	);
}
