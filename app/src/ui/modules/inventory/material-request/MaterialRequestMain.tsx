"use client";

import Link from "next/link";
import { ClipboardList, Download, Plus, Search, Upload } from "lucide-react";
import {
				MaterialRequestHref,
				MaterialRequestStatusFilterOptions,
				MaterialRequestTablePaginationStorageKey,
				MaterialRequestWarehouseFilterOptions,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import { useMaterialRequestMain } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestMain";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MaterialRequestMetrics } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestMetrics";
import { MaterialRequestTableRow } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestTableRow";

export function MaterialRequestMain() {
	const page = useMaterialRequestMain();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Material Request"
				description="Create, track and manage material requests for warehouse fulfillment."
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory request
					</>
				}
				actions={
					<>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Upload
						</button>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Export
						</button>
						<Link
							href={`${MaterialRequestHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							New Material Request
						</Link>
					</>
				}
			/>

			<MaterialRequestMetrics metrics={page.metrics} />

			<ModuleTable
				emptyDescription="Try another Material Request No., material, warehouse, requester, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No material requests found"
				isLoading={page.isLoading}
				minWidthClassName="min-w-[82rem]"
				paginationLabel="entries"
				paginationStorageKey={MaterialRequestTablePaginationStorageKey}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={page.table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_repeat(3,minmax(10rem,1fr))]">
						<ModuleTableSearch
							label="Search material requests"
							value={page.query}
							onChange={page.handleQueryChange}
							placeholder="Search by Material Request No., Material, or Reference"
						/>
						<ModuleTableFilterSelect
							label="To Warehouse"
							value={page.toWarehouseFilter}
							onChange={page.setToWarehouseFilter}
							options={MaterialRequestWarehouseFilterOptions}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							onChange={page.setStatusFilter}
							options={MaterialRequestStatusFilterOptions}
						/>
						<ModuleTableResetButton onClick={page.resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<MaterialRequestTableRow
						key={id}
						request={original}
						onDeleteRequest={page.setPendingDeleteRequest}
						onUpdateRequestStatus={page.updateRequestStatus}
					/>
				)}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDeleteRequest)}
				isPending={page.isMutating}
				title="Delete material request?"
				description={`This will remove ${page.pendingDeleteRequest?.requestNo ?? "the selected request"}.`}
				confirmLabel="Delete Request"
				tone="danger"
				onCancel={() => page.setPendingDeleteRequest(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
