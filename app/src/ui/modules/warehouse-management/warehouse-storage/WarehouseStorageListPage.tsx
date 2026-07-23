"use client";

import { useCallback, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { useWarehouseStorageListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-storage/useWarehouseStorageListPage";
import type { WarehouseStorageDrawerState, WarehouseStorageListRecord } from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WarehouseStorageDetailsPanel } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageDetailsPanel";
import { WarehouseStorageDrawer } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageDrawer";
import { WarehouseStorageHeader } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageHeader";
import { WarehouseStorageMapView } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageMapView";
import { WarehouseStorageStatisticCards } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageStatisticCards";
import { WarehouseStorageTable } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageTable";

export function WarehouseStorageListPage() {
	const page = useWarehouseStorageListPage();
	const [drawerState, setDrawerState] = useState<WarehouseStorageDrawerState>(null);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.statusFilter !== "All" ||
		page.warehouseFilter !== "All";
	const findListRecord = useCallback(
		(record: WarehouseModuleRecord) =>
			page.listRecords.find((location) => location.id === record.id || location.recordId === record.recordId),
		[page.listRecords],
	);
	const openDrawerFromModuleRecord = useCallback(
		(mode: "edit" | "view", record: WarehouseModuleRecord) => {
			const location = findListRecord(record);

			if (location) {
				setDrawerState({ mode, record: location });
				page.setSelectedRecordId(location.id);
			}
		},
		[findListRecord, page],
	);
	const openEditDrawer = useCallback((record: WarehouseStorageListRecord) => {
		setDrawerState({ mode: "edit", record });
		page.setSelectedRecordId(record.id);
	}, [page]);

	return (
		<section className="grid gap-5">
			<WarehouseStorageHeader onAdd={() => setDrawerState({ mode: "add" })} />
			<WarehouseStorageStatisticCards
				isLoading={page.isLoading}
				statistics={page.statistics}
			/>
			<section className="rounded-lg border border-skyblue/20 bg-skyblue/8 px-4 py-3 text-sm text-darknavy/70">
				<strong className="font-semibold text-darknavy">Sample storage layout:</strong>{" "}
				Use these examples to understand simple locations, structured bins, cold storage, and items inside each storage code. Live warehouse storage data can replace this once the backend resource is connected.
			</section>
			<section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
				<div className="grid gap-4">
					<ViewModeToggle value={page.viewMode} onChange={page.setViewMode} />
					{page.viewMode === "List" ? (
						<WarehouseStorageTable
							page={page}
							hasActiveFilters={hasActiveFilters}
							onEditRecord={(record) => openDrawerFromModuleRecord("edit", record)}
							onViewRecord={(record) => openDrawerFromModuleRecord("view", record)}
						/>
					) : (
						<WarehouseStorageMapView
							isLoading={page.isLoading}
							records={page.filteredListRecords}
							selectedRecordId={page.selectedRecord?.id ?? null}
							warehouses={page.warehouses}
							onSelectRecord={page.setSelectedRecordId}
						/>
					)}
				</div>
				<WarehouseStorageDetailsPanel
					record={page.selectedRecord}
					warehouses={page.warehouses}
					onEditRecord={openEditDrawer}
				/>
			</section>
			<WarehouseStorageDrawer
				key={`${drawerState?.mode ?? "closed"}-${drawerState?.record?.id ?? "new"}`}
				isOpen={Boolean(drawerState)}
				isSaving={page.isMutating}
				mode={drawerState?.mode ?? "add"}
				record={drawerState?.record}
				warehouses={page.warehouses}
				onClose={() => setDrawerState(null)}
				onSave={(form, record) => {
					page.saveLocation(form, record, record ? "edit" : "add");
					setDrawerState(null);
				}}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingDelete)}
				isPending={page.isMutating}
				title="Remove warehouse storage?"
				description="This will remove the selected warehouse storage record from the current data set."
				confirmLabel="Remove"
				tone="danger"
				onCancel={() => page.setPendingDelete(null)}
				onConfirm={page.confirmDelete}
			/>
		</section>
	);
}

function ViewModeToggle({
	onChange,
	value,
}: {
	onChange: (value: "List" | "Map") => void;
	value: "List" | "Map";
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-darknavy/10 bg-white px-4 py-3 shadow-sm">
			<div>
				<h2 className="text-sm font-semibold text-darknavy">Location workspace</h2>
				<p className="mt-1 text-xs text-darknavy/50">List is for maintenance. Map groups storage codes and shows item counts.</p>
			</div>
			<div className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite p-1">
				<ToggleButton icon={List} isActive={value === "List"} label="List" onClick={() => onChange("List")} />
				<ToggleButton icon={LayoutGrid} isActive={value === "Map"} label="Map" onClick={() => onChange("Map")} />
			</div>
		</div>
	);
}

function ToggleButton({
	icon: Icon,
	isActive,
	label,
	onClick,
}: {
	icon: typeof List;
	isActive: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={joinClasses(
				"inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
				isActive ? "bg-white text-skyblue shadow-sm" : "text-darknavy/60 hover:text-darknavy",
			)}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}
