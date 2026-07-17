"use client";

import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import {
	WarehouseAccessActionLabel,
	WarehouseAccessDescription,
	WarehouseAccessHref,
	WarehouseAccessTitle,
} from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import { useWarehouseAccessListPage } from "@/app/src/hooks/modules/maintenance/warehouse-access/useWarehouseAccessListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseAccessStatisticCards } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessStatisticCards";
import { WarehouseAccessTable } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessTable";

export function WarehouseAccessListPage() {
	const page = useWarehouseAccessListPage();
	const hasActiveFilters =
		page.query.trim().length > 0 || page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={WarehouseAccessTitle}
				description={WarehouseAccessDescription}
				eyebrow={
					<>
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						Warehouse management
					</>
				}
				actions={
					<Link
						href={`${WarehouseAccessHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{WarehouseAccessActionLabel}
					</Link>
				}
			/>
			<WarehouseAccessStatisticCards
				isLoading={page.isLoading}
				statistics={page.statistics}
			/>
			<WarehouseAccessTable page={page} hasActiveFilters={hasActiveFilters} />
			<AppDialog
				isOpen={Boolean(page.pendingDelete)}
				isPending={page.isMutating}
				title="Remove warehouse access?"
				description="This will remove the selected warehouse access record from the current data set."
				confirmLabel="Remove"
				tone="danger"
				onCancel={() => page.setPendingDelete(null)}
				onConfirm={page.confirmDelete}
			/>
		</section>
	);
}
