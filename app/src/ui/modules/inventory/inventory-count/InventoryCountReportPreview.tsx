import type { ReactNode } from "react";
import {
	ReportPreviewDrawer,
} from "@/app/src/ui/shared/reports/Reports";
import type { InventoryCountValues } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

type InventoryCountReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onPrint: () => void;
	values: InventoryCountValues;
};

export function InventoryCountReportPreview({
	isOpen,
	onClose,
	onPrint,
	values,
}: InventoryCountReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Inventory Count Preview"
			description="Review the printable inventory count report layout."
			onClose={onClose}
			onGeneratePdf={onPrint}
		>
			<div className="mx-auto w-full max-w-[58rem] min-h-[34rem] bg-white px-5 py-8 text-[11px] text-black shadow-sm print:p-0 print:shadow-none">
				<div className="grid grid-cols-[9rem_1fr_9rem] items-start">
					<div className="pt-1">
						{/* eslint-disable-next-line @next/next/no-img-element -- Print preview uses a static public asset. */}
						<img
							src="/img/icons/gr8booksneo-logo-wide.png"
							alt="Company logo"
							className="h-20 w-28 object-contain"
						/>
					</div>
					<div className="text-center">
						<p className="text-base font-bold">Your Company Name Here</p>
						<p className="mt-1 text-[11px] font-semibold">
							VAT REG TIN : 000-000-000-000
						</p>
						<p className="mt-2 text-[11px] font-semibold">
							ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT
						</p>
						<p className="mt-3 text-[11px] font-semibold">
							Telephone No: 0967-237-4514
						</p>
					</div>
					<div />
				</div>

				<h2 className="mt-8 text-center text-xl font-bold">
					Inventory Count
				</h2>

				<div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-semibold">
					<p>Warehouse: {values.warehouse}</p>
					<p>Uploader: {values.uploader || "-"}</p>
					<p>Inventory Count No.: {values.countNo}</p>
					<p>Inventory Count Date: {values.countDate}</p>
				</div>

				<div className="mt-5 overflow-hidden">
					<table className="w-full table-fixed border-collapse border border-black text-[11px]">
						<colgroup>
							<col className="w-[16%]" />
							<col className="w-[32%]" />
							<col className="w-[8%]" />
							<col className="w-[15%]" />
							<col className="w-[15%]" />
							<col className="w-[14%]" />
						</colgroup>
						<thead>
							<tr>
								<ReportHeaderCell>Item Code</ReportHeaderCell>
								<ReportHeaderCell>Description</ReportHeaderCell>
								<ReportHeaderCell>UOM</ReportHeaderCell>
								<ReportHeaderCell>StockQTY</ReportHeaderCell>
								<ReportHeaderCell>InventoryCountQTY</ReportHeaderCell>
								<ReportHeaderCell>VarianceQTY</ReportHeaderCell>
							</tr>
						</thead>
						<tbody>
							{values.lines.map((row) => (
								<tr key={row.id}>
									<ReportCell>{row.itemCode}</ReportCell>
									<ReportCell>{row.itemName}</ReportCell>
									<ReportCell>{row.uom}</ReportCell>
									<ReportCell>{formatQuantity(row.systemQty)}</ReportCell>
									<ReportCell>{formatQuantity(row.countQty)}</ReportCell>
									<ReportCell>{formatQuantity(row.variance)}</ReportCell>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</ReportPreviewDrawer>
	);
}

function ReportHeaderCell({ children }: { children: ReactNode }) {
	return (
		<th className="border border-black px-1.5 py-1.5 text-center font-bold">
			{children}
		</th>
	);
}

function ReportCell({ children }: { children?: ReactNode }) {
	return (
		<td className="border border-black px-1.5 py-1 text-center">
			{children || "\u00a0"}
		</td>
	);
}

function formatQuantity(value: string) {
	const quantity = Number.parseFloat(value);

	return Number.isFinite(quantity) ? quantity.toFixed(2) : "0.00";
}
