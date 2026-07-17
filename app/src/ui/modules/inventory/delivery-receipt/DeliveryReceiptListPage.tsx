"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	Clock3,
	Download,
	PackageCheck,
	PackageOpen,
	Plus,
	Search,
	Truck,
	Upload,
	XCircle,
} from "lucide-react";
import {
	countDeliveryReceiptsByStatus,
	formatDeliveryReceiptDate,
	formatDeliveryReceiptPercentage,
	formatDeliveryReceiptQuantity,
	isDeliveryReceiptActiveStatus,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import {
	DeliveryReceiptHref,
	DeliveryReceiptStatusFilterOptions,
	DeliveryReceiptTablePaginationStorageKey,
} from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import {
	useDeliveryReceiptStore,
	useDeliveryReceiptTable,
} from "@/app/src/hooks/modules/inventory/delivery-receipt/useDeliveryReceipt";
import type {
	DeliveryReceiptRecord,
	DeliveryReceiptStatus,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { DeliveryReceiptRecordActions } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptRecordActions";

export function DeliveryReceiptListPage() {
	const { receipts, lastSyncedAt, updateReceiptStatus } =
		useDeliveryReceiptStore();
	const tableState = useDeliveryReceiptTable(receipts);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Delivery Receipt"
				description="Prepare customer delivery details, document references, vehicle information, and item entries."
				eyebrow={
					<>
						<Truck className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<DeliveryReceiptListHeaderActions />}
			/>

			<DeliveryReceiptMetrics records={receipts} />

			<ModuleTable
				emptyDescription="Try a different transaction number, VCE, reference, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No delivery receipts matched"
				minWidthClassName="min-w-[76rem]"
				paginationLabel="entries"
				paginationStorageKey={DeliveryReceiptTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={tableState.table}
				tableTitle="Delivery receipt entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Delivery Receipts"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by trans no., VCE, or reference"
						/>
						<DateRangePicker
							label="Date Range"
							value={tableState.dateRange}
							onChange={tableState.setDateRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={tableState.statusFilter}
							options={DeliveryReceiptStatusFilterOptions}
							onChange={(value) =>
								tableState.setStatusFilter(
									value as Parameters<typeof tableState.setStatusFilter>[0],
								)
							}
						/>
						<ModuleTableResetButton onClick={tableState.resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold text-skyblue">
							{original.transactionNo}
						</td>
						<td className="px-4 py-4">
							{formatDeliveryReceiptDate(original.deliveryDate)}
						</td>
						<td className="px-4 py-4">{original.customerName}</td>
						<td className="px-4 py-4">{original.referenceNo}</td>
						<td className="px-4 py-4 font-semibold text-darknavy">
							{formatDeliveryReceiptQuantity(original.totalQuantity)}
						</td>
						<td className="px-4 py-4">
							<DeliveryReceiptStatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<DeliveryReceiptRecordActions
								record={original}
								onUpdateStatus={updateReceiptStatus}
							/>
						</td>
					</tr>
				)}
			/>
		</section>
	);
}

function DeliveryReceiptListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={DeliveryReceiptListOverflowItems}
					label="Delivery Receipt list actions"
				/>
			</div>
			<div className="hidden items-center gap-2 lg:flex">
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
			</div>
			<Link
				href={`${DeliveryReceiptHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Delivery Receipt
			</Link>
		</>
	);
}

const DeliveryReceiptListOverflowItems = [
	{
		icon: Upload,
		label: "Upload",
		onSelect: () => undefined,
		type: "button",
	},
	{
		icon: Download,
		label: "Export",
		onSelect: () => undefined,
		type: "button",
	},
] satisfies ModuleActionMenuItem[];

function DeliveryReceiptMetrics({
	records,
}: {
	records: DeliveryReceiptRecord[];
}) {
	const activeCount = records.filter((record) =>
		isDeliveryReceiptActiveStatus(record.status),
	).length;
	const approvedCount = countDeliveryReceiptsByStatus(records, "Approved");
	const disapprovedCount = countDeliveryReceiptsByStatus(records, "Disapproved");
	const pendingCount = countDeliveryReceiptsByStatus(records, "Pending");
	const closedCount = countDeliveryReceiptsByStatus(records, "Closed");

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-6"
			items={[
				{
					label: "Total Receipts",
					value: records.length,
					summary: "All time",
					icon: Truck,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Active",
					value: activeCount,
					summary: formatDeliveryReceiptPercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatDeliveryReceiptPercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatDeliveryReceiptPercentage(
						approvedCount,
						records.length,
					),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Disapproved",
					value: disapprovedCount,
					summary: formatDeliveryReceiptPercentage(
						disapprovedCount,
						records.length,
					),
					icon: XCircle,
					iconClassName: "bg-coralpink/15 text-coralpink",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatDeliveryReceiptPercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function DeliveryReceiptStatusBadge({
	status,
}: {
	status: DeliveryReceiptStatus;
}) {
	const Icon = statusIconByStatus[status];

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status],
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

const statusIconByStatus = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Disapproved: XCircle,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<DeliveryReceiptStatus, typeof PackageOpen>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<DeliveryReceiptStatus, string>;
