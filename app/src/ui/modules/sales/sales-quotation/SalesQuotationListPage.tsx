"use client";

import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import {
	SalesQuotationHref,
	SalesQuotationTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { useSalesQuotationListPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationListPage";
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
import { SalesQuotationTableRow } from "@/app/src/ui/modules/sales/sales-quotation/SalesQuotationTableRow";

export function SalesQuotationListPage() {
	const {
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		lastSyncedAt,
		pendingDeleteRequest,
		query,
		setPendingDeleteRequest,
		table,
	} = useSalesQuotationListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Quotation"
				description="Prepare sales quotations, review party details, and preview the printable quotation before approval."
				eyebrow={
					<>
						<ClipboardList
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						Sales document
					</>
				}
				actions={
					<Link
						href={`${SalesQuotationHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						New Sales Quotation
					</Link>
				}
			/>

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					variant="embedded"
					emptyDescription="Try another quotation no., party, project, or status."
					emptyIcon={
						<Search className="h-5 w-5" aria-hidden="true" />
					}
					emptyTitle="No sales quotations found"
					lastSyncedAt={lastSyncedAt}
					minWidthClassName="min-w-[74rem]"
					paginationStorageKey={
						SalesQuotationTablePaginationStorageKey
					}
					table={table}
					tableTitle="Sales quotations"
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
							<ModuleTableSearch
								label="Search sales quotations"
								value={query}
								onChange={handleQueryChange}
							placeholder="Search by quotation no., party, project, or status"
							/>
						</ModuleTableToolbar>
					}
					renderRow={({ id, original }) => (
						<SalesQuotationTableRow
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
				title="Delete sales quotation?"
				description={`This will remove quotation ${pendingDeleteRequest?.transNo ?? "the selected quotation"}.`}
				confirmLabel="Delete Quotation"
				tone="danger"
				onCancel={() => setPendingDeleteRequest(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
