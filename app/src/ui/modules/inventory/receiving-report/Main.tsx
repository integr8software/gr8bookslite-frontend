"use client";

import Link from "next/link";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Boxes, Clock3, Download, PackageCheck, Plus, Search, Upload } from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

const ReceivingReportHref = "/inventory/receiving-report";

type ReceivingReportListRecord = {
	id: string;
	documentNo: string;
	documentDate: string;
	vendor: string;
	warehouse: string;
	status: string;
	netAmount: string;
};

export function ReceivingReportMain() {
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: ReceivingReportRecords,
		columns: ReceivingReportColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
	});

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Receiving Report"
				description="Search receiving reports, review warehouse receipts, and create or update received item entries."
				eyebrow={
					<>
						<Boxes className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory
					</>
				}
				actions={<ReceivingReportListHeaderActions />}
			/>

			<ModuleStatisticCards
				className="2xl:grid-cols-4"
				items={[
					{
						label: "Total Reports",
						value: ReceivingReportRecords.length,
						summary: "All time",
						icon: Boxes,
						iconClassName: "bg-skyblue/20 text-skyblue",
					},
					{
						label: "Draft",
						value: 0,
						summary: "Pending completion",
						icon: Clock3,
						iconClassName: "bg-offwhite text-darknavy",
					},
					{
						label: "Approved",
						value: 0,
						summary: "Ready for posting",
						icon: PackageCheck,
						iconClassName: "bg-citron/25 text-darknavy",
					},
					{
						label: "Total Net",
						value: "0.0000",
						summary: "Received amount",
						icon: PackageCheck,
						iconClassName: "bg-skyblue/15 text-skyblue",
					},
				]}
			/>

			<ModuleTable
				emptyDescription="Start a new receiving report to record received items, costs, taxes, and warehouse details."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No receiving reports yet"
				minWidthClassName="min-w-[78rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="records"
				paginationStorageKey="inventory-receiving-report"
				table={table}
				tableTitle="Receiving reports"
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold text-skyblue">
							{original.documentNo}
						</td>
						<td className="px-4 py-4">{original.documentDate}</td>
						<td className="px-4 py-4">{original.vendor}</td>
						<td className="px-4 py-4">{original.warehouse}</td>
						<td className="px-4 py-4">{original.netAmount}</td>
						<td className="px-4 py-4">{original.status}</td>
					</tr>
				)}
			/>
		</section>
	);
}

function ReceivingReportListHeaderActions() {
	return (
		<>
			<div className="hidden items-center gap-2 lg:flex">
				<button type="button" className={moduleHeaderActionClassNames.secondary}>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Upload
				</button>
				<button type="button" className={moduleHeaderActionClassNames.secondary}>
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</button>
			</div>
			<Link
				href={`${ReceivingReportHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Receiving Report
			</Link>
		</>
	);
}

const columnHelper = createColumnHelper<ReceivingReportListRecord>();

const ReceivingReportColumns = [
	columnHelper.accessor("documentNo", {
		header: "Document No",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("documentDate", {
		header: "Document Date",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("vendor", {
		header: "Vendor",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("warehouse", {
		header: "Warehouse",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("netAmount", {
		header: "Net Amount",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => info.getValue(),
	}),
];

const ReceivingReportRecords: ReceivingReportListRecord[] = [];
