"use client";

import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import {
	CanvassFormHref,
	CanvassFormTablePaginationStorageKey,
} from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import { useCanvassFormOverviewPage } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassFormPage";
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
import { CanvassFormRecordActions } from "@/app/src/ui/modules/purchasing/canvass-form/overview/CanvassFormRecordActions";

export function CanvassFormOverviewPage() {
	const {
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		lastSyncedAt,
		pendingDeleteForm,
		query,
		setPendingDeleteForm,
		table,
	} = useCanvassFormOverviewPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Canvass Order"
				description="Compare supplier quotations and select the best supplier cost."
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Purchasing document
					</>
				}
				actions={
					<Link href={`${CanvassFormHref}/add`} className={moduleHeaderActionClassNames.primary}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						New Canvass Order
					</Link>
				}
			/>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<ModuleTable
					variant="embedded"
					emptyDescription="Try another trans no., requester, type, or status."
					emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
					emptyTitle="No canvass orders found"
					lastSyncedAt={lastSyncedAt}
					minWidthClassName="min-w-[64rem]"
					paginationStorageKey={CanvassFormTablePaginationStorageKey}
					table={table}
					tableTitle="Canvass orders"
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
							<ModuleTableSearch
								label="Search canvass forms"
								value={query}
								onChange={handleQueryChange}
								placeholder="Search by trans no., requester, type, or status"
							/>
						</ModuleTableToolbar>
					}
					renderRow={({ id, original }) => (
						<CanvassFormRecordActions
							key={id}
							form={original}
							onDeleteForm={setPendingDeleteForm}
						/>
					)}
				/>
			</div>
			<AppDialog
				isOpen={Boolean(pendingDeleteForm)}
				isPending={isMutating}
				title="Delete canvass form?"
				description={`This will remove ${pendingDeleteForm?.transNo ?? "the selected form"}.`}
				confirmLabel="Delete Form"
				tone="danger"
				onCancel={() => setPendingDeleteForm(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
