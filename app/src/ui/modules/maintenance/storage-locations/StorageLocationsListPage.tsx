"use client";

import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import {
	StorageLocationsActionLabel,
	StorageLocationsDescription,
	StorageLocationsHref,
	StorageLocationsTitle,
} from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import { useStorageLocationsListPage } from "@/app/src/hooks/modules/maintenance/storage-locations/useStorageLocationsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { StorageLocationStatisticCards } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationStatisticCards";
import { StorageLocationTable } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationTable";

export function StorageLocationsListPage() {
	const page = useStorageLocationsListPage();
	const hasActiveFilters =
		page.query.trim().length > 0 || page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={StorageLocationsTitle}
				description={StorageLocationsDescription}
				eyebrow={
					<>
						<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
						Warehouse management
					</>
				}
				actions={
					<Link
						href={`${StorageLocationsHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{StorageLocationsActionLabel}
					</Link>
				}
			/>
			<StorageLocationStatisticCards
				isLoading={page.isLoading}
				statistics={page.statistics}
			/>
			<StorageLocationTable page={page} hasActiveFilters={hasActiveFilters} />
			<AppDialog
				isOpen={Boolean(page.pendingDelete)}
				isPending={page.isMutating}
				title="Remove storage location?"
				description="This will remove the selected storage location from the current data set."
				confirmLabel="Remove"
				tone="danger"
				onCancel={() => page.setPendingDelete(null)}
				onConfirm={page.confirmDelete}
			/>
		</section>
	);
}
