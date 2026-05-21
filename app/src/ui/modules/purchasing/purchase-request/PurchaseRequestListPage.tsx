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
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { PurchaseRequestTableRow } from "./PurchaseRequestTableRow";

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
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
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

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
				<label className="relative block">
					<span className="sr-only">Search purchase requests</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => handleQueryChange(event.target.value)}
						placeholder="Search by PR no., supplier, project, or status"
						className="h-12 w-full rounded-lg border border-darknavy/10 bg-offwhite/65 pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
			</div>

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					emptyDescription="Try another PR no., supplier, project, or status."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No purchase requests found"
					minWidthClassName="min-w-[74rem]"
					paginationStorageKey={PurchaseRequestTablePaginationStorageKey}
					table={table}
					renderRow={({ id, original }) => (
						<PurchaseRequestTableRow
							key={id}
							request={original}
							onDeleteRequest={setPendingDeleteRequest}
						/>
					)}
				/>
			</div>

			<AppConfirmDialog
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
