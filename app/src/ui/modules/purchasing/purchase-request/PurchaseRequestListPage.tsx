"use client";

import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import {
	PurchaseRequestHref,
	PurchaseRequestTablePaginationStorageKey,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { usePurchaseRequestListPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PurchaseRequestTableRow } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestTableRow";

export function PurchaseRequestListPage() {
	const {
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		pendingDeleteRequest,
		query,
		setPendingDeleteRequest,
		table,
	} = usePurchaseRequestListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Purchase Request"
				description="Prepare purchase requests, review supplier details, and preview the printable request form before approval."
				eyebrow={
					<>
						<ClipboardList
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						Purchasing document
					</>
				}
				actions={
					<Link
						href={`${PurchaseRequestHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						New Request
					</Link>
				}
			/>

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					variant="embedded"
					emptyDescription="Try another PR no., supplier, project, or status."
					emptyIcon={
						<Search className="h-5 w-5" aria-hidden="true" />
					}
					emptyTitle="No purchase requests found"
					minWidthClassName="min-w-[74rem]"
					paginationStorageKey={
						PurchaseRequestTablePaginationStorageKey
					}
					table={table}
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
							<ModuleTableSearch
								label="Search purchase requests"
								value={query}
								onChange={handleQueryChange}
								placeholder="Search by PR no., supplier, project, or status"
							/>
						</ModuleTableToolbar>
					}
					renderRow={({ id, original }) => (
						<PurchaseRequestTableRow
							key={id}
							request={original}
							onDeleteRequest={setPendingDeleteRequest}
						/>
					)}
				/>
			</div>

			<AppDialog
				isOpen={Boolean(pendingDeleteRequest)}
				isPending={isMutating}
				title="Delete purchase request?"
				description={`This will remove PR ${pendingDeleteRequest?.transNo ?? "the selected request"}.`}
				confirmLabel="Delete Request"
				tone="danger"
				onCancel={() => setPendingDeleteRequest(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
