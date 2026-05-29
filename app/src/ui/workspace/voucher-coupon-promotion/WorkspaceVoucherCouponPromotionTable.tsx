"use client";

import { Tags } from "lucide-react";
import {
	WorkspaceVoucherCouponPromotionPaginationStorageKey,
	WorkspaceVoucherCouponPromotionStatusOptions,
	WorkspaceVoucherCouponPromotionTypeOptions,
} from "@/app/src/constants/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionConstants";
import type { useWorkspaceVoucherCouponPromotionPage } from "@/app/src/hooks/workspace/voucher-coupon-promotion/useWorkspaceVoucherCouponPromotionPage";
import type {
	WorkspaceVoucherCouponPromotionRecord,
	WorkspaceVoucherCouponPromotionStatusFilter,
	WorkspaceVoucherCouponPromotionTypeFilter,
} from "@/app/src/types/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { WorkspaceVoucherCouponPromotionTableRow } from "@/app/src/ui/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTableRow";

type WorkspaceVoucherCouponPromotionTableProps = Pick<
	ReturnType<typeof useWorkspaceVoucherCouponPromotionPage>,
	| "query"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "setTypeFilter"
	| "statusFilter"
	| "table"
	| "typeFilter"
>;

export function WorkspaceVoucherCouponPromotionTable({
	query,
	resetFilters,
	setQuery,
	setStatusFilter,
	setTypeFilter,
	statusFilter,
	table,
	typeFilter,
}: WorkspaceVoucherCouponPromotionTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleTable<WorkspaceVoucherCouponPromotionRecord>
				variant="embedded"
				emptyDescription="Try a different subscriber, promotion code, type, status, invoice, or owner."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscriber promotions found"
				minWidthClassName="min-w-[92rem]"
				paginationStorageKey={WorkspaceVoucherCouponPromotionPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search voucher, coupon, and promotion assignments"
							value={query}
							onChange={setQuery}
							placeholder="Search companies, codes, invoices, or owners"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={WorkspaceVoucherCouponPromotionStatusOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setStatusFilter(
									value as WorkspaceVoucherCouponPromotionStatusFilter,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Type"
							value={typeFilter}
							options={WorkspaceVoucherCouponPromotionTypeOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setTypeFilter(value as WorkspaceVoucherCouponPromotionTypeFilter)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WorkspaceVoucherCouponPromotionTableRow
						key={row.id}
						record={row.original}
					/>
				)}
			/>
		</div>
	);
}

