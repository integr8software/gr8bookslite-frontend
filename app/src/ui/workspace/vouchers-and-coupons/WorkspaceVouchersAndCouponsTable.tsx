"use client";

import { Tags } from "lucide-react";
import {
	WorkspaceVouchersAndCouponsPaginationStorageKey,
	WorkspaceVouchersAndCouponsStatusOptions,
	WorkspaceVouchersAndCouponsTypeOptions,
} from "@/app/src/constants/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsConstants";
import type { useWorkspaceVouchersAndCouponsPage } from "@/app/src/hooks/workspace/vouchers-and-coupons/useWorkspaceVouchersAndCouponsPage";
import type {
	WorkspaceVouchersAndCouponsRecord,
	WorkspaceVouchersAndCouponsStatusFilter,
	WorkspaceVouchersAndCouponsTypeFilter,
} from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { WorkspaceVouchersAndCouponsTableRow } from "@/app/src/ui/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTableRow";

type WorkspaceVouchersAndCouponsTableProps = Pick<
	ReturnType<typeof useWorkspaceVouchersAndCouponsPage>,
	| "query"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "setTypeFilter"
	| "statusFilter"
	| "table"
	| "typeFilter"
>;

export function WorkspaceVouchersAndCouponsTable({
	query,
	resetFilters,
	setQuery,
	setStatusFilter,
	setTypeFilter,
	statusFilter,
	table,
	typeFilter,
}: WorkspaceVouchersAndCouponsTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleTable<WorkspaceVouchersAndCouponsRecord>
				variant="embedded"
				emptyDescription="Try a different subscriber, code, type, status, invoice, or owner."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No vouchers or coupons found"
				minWidthClassName="min-w-[92rem]"
				paginationStorageKey={WorkspaceVouchersAndCouponsPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search voucher and coupon assignments"
							value={query}
							onChange={setQuery}
							placeholder="Search companies, codes, invoices, or owners"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={WorkspaceVouchersAndCouponsStatusOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setStatusFilter(
									value as WorkspaceVouchersAndCouponsStatusFilter,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Type"
							value={typeFilter}
							options={WorkspaceVouchersAndCouponsTypeOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setTypeFilter(value as WorkspaceVouchersAndCouponsTypeFilter)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WorkspaceVouchersAndCouponsTableRow
						key={row.id}
						record={row.original}
					/>
				)}
			/>
		</div>
	);
}
