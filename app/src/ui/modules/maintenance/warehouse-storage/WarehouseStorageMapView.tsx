"use client";

import { LayoutGrid, PackageSearch } from "lucide-react";
import type { WarehouseStorageListRecord } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseStorageMapViewProps = {
	isLoading: boolean;
	records: WarehouseStorageListRecord[];
	selectedRecordId: string | null;
	warehouses: WarehouseRecord[];
	onSelectRecord: (recordId: string) => void;
};

export function WarehouseStorageMapView({
	isLoading,
	onSelectRecord,
	records,
	selectedRecordId,
	warehouses,
}: WarehouseStorageMapViewProps) {
	if (isLoading) {
		return (
			<section className="rounded-lg border border-darknavy/10 bg-white p-6 shadow-sm">
				<div className="h-6 w-44 animate-pulse rounded bg-offwhite" />
				<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="h-32 animate-pulse rounded-lg bg-offwhite" />
					))}
				</div>
			</section>
		);
	}

	if (records.length === 0) {
		return (
			<section className="rounded-lg border border-dashed border-darknavy/15 bg-white p-8 text-center shadow-sm">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-offwhite text-darknavy/55">
					<LayoutGrid className="h-5 w-5" aria-hidden="true" />
				</div>
				<h2 className="mt-4 text-lg font-semibold text-darknavy">No locations to map</h2>
				<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-darknavy/55">
					Add simple areas or structured storage codes first. The map will group them by warehouse and show item counts when stock is assigned.
				</p>
			</section>
		);
	}

	return (
		<section className="grid gap-4">
			{warehouses
				.filter((warehouse) => records.some((record) => record.warehouseId === warehouse.id))
				.map((warehouse) => {
					const warehouseRecords = records.filter((record) => record.warehouseId === warehouse.id);

					return (
						<div key={warehouse.id} className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-5 py-4">
								<div>
									<h2 className="text-base font-semibold text-darknavy">{warehouse.name}</h2>
									<p className="mt-1 text-xs text-darknavy/50">{warehouseRecords.length} warehouse storage{warehouseRecords.length === 1 ? "" : "s"}</p>
								</div>
								<span className="text-xs font-semibold text-darknavy/55">{warehouse.code}</span>
							</div>
							<div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
								{warehouseRecords.map((record) => (
									<button
										key={record.id}
										type="button"
										onClick={() => onSelectRecord(record.id)}
										className={joinClasses(
											"grid min-h-36 gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
											selectedRecordId === record.id
												? "border-skyblue bg-skyblue/8"
												: "border-darknavy/10 bg-white hover:border-skyblue/50 hover:bg-offwhite/60",
										)}
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<span className="block text-sm font-semibold text-skyblue">{record.location.locationCode}</span>
												<span className="mt-1 block text-sm font-semibold text-darknavy">{record.location.locationName || record.path}</span>
											</div>
											<ModuleStatusBadge status={record.status} />
										</div>
										<p className="line-clamp-2 text-xs leading-5 text-darknavy/55">{record.path}</p>
										<div className="mt-auto flex items-center justify-between gap-3 rounded-md bg-offwhite px-3 py-2">
											<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-darknavy/60">
												<PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
												Items
											</span>
											<span className="text-sm font-semibold text-darknavy">{record.itemCount}</span>
										</div>
									</button>
								))}
							</div>
						</div>
					);
				})}
		</section>
	);
}
