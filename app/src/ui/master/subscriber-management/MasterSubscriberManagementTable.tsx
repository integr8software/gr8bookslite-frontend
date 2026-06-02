"use client";

import type { ReactNode } from "react";
import { Download, Search } from "lucide-react";
import {
	MasterSubscriberManagementPaginationStorageKey,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import type { useMasterSubscriberManagementListPage } from "@/app/src/hooks/master/subscriber-management/useMasterSubscriberManagementListPage";
import type { MasterSubscriberManagementStatus } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterSubscriberManagementTableRow } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementTableRow";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriberManagementTableProps = ReturnType<
	typeof useMasterSubscriberManagementListPage
>;

export function MasterSubscriberManagementTable({
	query,
	registeredDateRange,
	registeredDateRangeReferenceDate,
	setQuery,
	setRegisteredDateRange,
	setStatusFilter,
	statusFilter,
	statusOptions,
	table,
}: MasterSubscriberManagementTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleTable
				emptyDescription="Try another subscriber name, email, contact number, status, or registration date."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscribers found"
				minWidthClassName="min-w-[92rem]"
				paginationLabel="results"
				paginationPageLimit={3}
				paginationStorageKey={
					MasterSubscriberManagementPaginationStorageKey
				}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={table}
				toolbar={
					<ModuleTableToolbar className="items-end lg:grid-cols-[minmax(18rem,2fr)_minmax(11rem,0.9fr)_minmax(10rem,0.75fr)_minmax(8rem,0.65fr)]">
						<ModuleTableSearch
							label="Search subscribers"
							onChange={setQuery}
							placeholder="Search by subscriber, email, or contact no..."
							value={query}
						/>
						<DateRangePicker
							label="Date Registered"
							onChange={setRegisteredDateRange}
							placeholder="Date range"
							referenceDate={registeredDateRangeReferenceDate}
							startMonth={registeredDateRangeReferenceDate}
							value={registeredDateRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							onChange={(value) =>
								setStatusFilter(
									value as MasterSubscriberManagementStatus | "All",
								)
							}
							options={[
								{ label: "All", value: "All" },
								...statusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							value={statusFilter}
						/>
						<ToolbarButton>
							<Download className="h-4 w-4" aria-hidden="true" />
							Export
						</ToolbarButton>
					</ModuleTableToolbar>
				}
				variant="embedded"
				renderRow={(row) => (
					<MasterSubscriberManagementTableRow
						key={row.id}
						subscriber={row.original}
					/>
				)}
			/>
		</div>
	);
}

function ToolbarButton({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={joinClasses(
				"inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
			)}
		>
			{children}
		</button>
	);
}
