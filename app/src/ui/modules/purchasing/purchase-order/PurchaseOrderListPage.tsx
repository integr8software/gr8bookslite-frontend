"use client";

import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import {
	PurchaseOrderHref,
	PurchaseOrderTablePaginationStorageKey,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import { usePurchaseOrderListPage } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrderListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { PurchaseOrderTableRow } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderTableRow";

export function PurchaseOrderListPage() {
	const {
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		lastSyncedAt,
		pendingDeleteOrder,
		query,
		setPendingDeleteOrder,
		table,
	} = usePurchaseOrderListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Purchase Order"
				description="Prepare supplier purchase orders, amounts, references, and order entries."
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Purchasing document
					</>
				}
				actions={
					<Link
						href={`${PurchaseOrderHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						New Purchase Order
					</Link>
				}
			/>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					variant="embedded"
					emptyDescription="Try another PO no., supplier, project, or status."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No purchase orders found"
					lastSyncedAt={lastSyncedAt}
					minWidthClassName="min-w-[74rem]"
					paginationStorageKey={PurchaseOrderTablePaginationStorageKey}
					table={table}
					tableTitle="Purchase orders"
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
							<ModuleTableSearch
								label="Search purchase orders"
								value={query}
								onChange={handleQueryChange}
								placeholder="Search by PO no., supplier, project, or status"
							/>
						</ModuleTableToolbar>
					}
					renderRow={({ id, original }) => (
						<PurchaseOrderTableRow
							key={id}
							order={original}
							onDeleteOrder={setPendingDeleteOrder}
						/>
					)}
				/>
			</div>
			<AppDialog
				isOpen={Boolean(pendingDeleteOrder)}
				isPending={isMutating}
				title="Delete purchase order?"
				description={`This will remove PO ${pendingDeleteOrder?.transNo ?? "the selected order"}.`}
				confirmLabel="Delete Order"
				tone="danger"
				onCancel={() => setPendingDeleteOrder(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
