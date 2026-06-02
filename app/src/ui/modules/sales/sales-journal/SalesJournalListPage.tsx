"use client";

import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import {
	SalesJournalHref,
	SalesJournalTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import { useSalesJournalListPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalListPage";
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
import { SalesJournalTableRow } from "@/app/src/ui/modules/sales/sales-journal/SalesJournalTableRow";

export function SalesJournalListPage() {
	const {
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		pendingDeleteRecord,
		query,
		setPendingDeleteRecord,
		table,
	} = useSalesJournalListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Journal"
				description="Record sales journal headers and accounting lines with balanced debit and credit totals."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales transaction
					</>
				}
				actions={
					<Link
						href={`${SalesJournalHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add
					</Link>
				}
			/>

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					variant="embedded"
					emptyDescription="Try another document no., party, remarks, or status."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No sales journals found"
					isLoading={isLoading}
					minWidthClassName="min-w-[74rem]"
					paginationStorageKey={SalesJournalTablePaginationStorageKey}
					table={table}
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
							<ModuleTableSearch
								label="Search sales journals"
								value={query}
								onChange={handleQueryChange}
								placeholder="Search by document no., party, remarks, or status"
							/>
						</ModuleTableToolbar>
					}
					renderRow={({ id, original }) => (
						<SalesJournalTableRow
							key={id}
							record={original}
							onDeleteRecord={setPendingDeleteRecord}
						/>
					)}
				/>
			</div>

			<AppDialog
				isOpen={Boolean(pendingDeleteRecord)}
				isPending={isMutating}
				title="Delete sales journal?"
				description={`This will remove ${pendingDeleteRecord?.documentNo ?? "the selected sales journal"}.`}
				confirmLabel="Delete Sales Journal"
				tone="danger"
				onCancel={() => setPendingDeleteRecord(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
