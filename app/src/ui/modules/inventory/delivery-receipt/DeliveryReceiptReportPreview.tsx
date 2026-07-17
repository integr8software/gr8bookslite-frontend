"use client";

import {
	formatDeliveryReceiptDate,
	formatDeliveryReceiptQuantity,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type DeliveryReceiptReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: DeliveryReceiptFormValues;
};

export function DeliveryReceiptReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: DeliveryReceiptReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="delivery-receipt-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Delivery Receipt Preview"
			description="Review the printable delivery receipt layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<DeliveryReceiptReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

function DeliveryReceiptReportDocument({
	values,
}: {
	values: DeliveryReceiptFormValues;
}) {
	const rows = values.lineEntries.filter(
		(entry) => entry.itemCode || entry.name || entry.description,
	);

	return (
		<div className="mx-auto w-full max-w-[52rem] bg-white p-3 text-[11px] text-black shadow-sm print:p-0 print:shadow-none">
			<div className="flex min-h-[68rem] flex-col border-2 border-black">
				<div className="grid grid-cols-[8.5rem_1fr_8.5rem] items-start px-4 pt-4">
					<div className="pt-1">
						<img
							src="/img/icons/gr8booksneo-logo-wide.png"
							alt="Company logo"
							className="h-16 w-24 object-contain"
						/>
					</div>
					<div className="text-center">
						<p className="text-sm font-bold">Your Company Name Here</p>
						<p className="mt-1 text-[10px] font-semibold">
							VAT REG TIN : 000-000-000-000
						</p>
						<p className="mt-1 text-[10px] font-semibold uppercase">
							ABC, 123, Sample, Malamig, City of Mandaluyong, NCR, Second District
						</p>
						<p className="mt-3 text-[10px] font-semibold">
							Telephone No: 0967-237-4514
						</p>
					</div>
					<div />
				</div>
				<div className="mt-2 grid grid-cols-[1fr_13rem] items-end border-b-2 border-black px-3 pb-1">
					<h2 className="text-2xl font-black uppercase leading-none">
						Delivery Receipt
					</h2>
					<div className="text-[11px] font-bold">
						<p>DR No. : {values.transactionNo || "-"}</p>
						<p>Date : {formatReportDate(values.documentDate)}</p>
					</div>
				</div>
				<div className="min-h-28 border-b-2 border-black px-2 py-1 text-[11px] font-bold">
					<InfoLine label="Customer" value={values.vceName} />
					<InfoLine label="Bill To" value={values.billToName} />
					<InfoLine label="Address" value={values.address} />
					<InfoLine label="Delivery Date" value={formatReportDate(values.deliveryDate)} />
					<InfoLine label="Driver" value={values.driverName} />
					<InfoLine label="Plate No." value={values.plateNo} />
					<InfoLine label="Remarks" value={values.remarks} />
				</div>
				<table className="w-full flex-1 border-collapse">
					<thead>
						<tr>
							<ReportCell className="w-[20%] text-center font-bold">
								Item Code
							</ReportCell>
							<ReportCell className="w-[40%] text-center font-bold">
								Description
							</ReportCell>
							<ReportCell className="w-[14%] text-center font-bold">Qty</ReportCell>
							<ReportCell className="w-[14%] text-center font-bold">UOM</ReportCell>
							<ReportCell className="text-center font-bold">Warehouse</ReportCell>
						</tr>
					</thead>
					<tbody>
						{rows.map((entry) => (
							<tr key={entry.id}>
								<ReportCell>{entry.itemCode}</ReportCell>
								<ReportCell>{entry.description || entry.name}</ReportCell>
								<ReportCell className="text-right">
									{formatQuantity(entry.quantity)}
								</ReportCell>
								<ReportCell>{entry.uom}</ReportCell>
								<ReportCell>{entry.warehouse}</ReportCell>
							</tr>
						))}
						<tr>
							<ReportCell className="h-full min-h-[25rem] border-b-0 align-top" />
							<ReportCell className="border-b-0 align-top" />
							<ReportCell className="border-b-0 align-top" />
							<ReportCell className="border-b-0 align-top" />
							<ReportCell className="border-b-0 align-top" />
						</tr>
					</tbody>
				</table>
				<div className="grid grid-cols-2 border-t-2 border-black">
					<SignatureBox label="Prepared by" />
					<SignatureBox label="Received by" />
				</div>
			</div>
		</div>
	);
}

function ReportCell({
	children,
	className = "",
}: {
	children?: string;
	className?: string;
}) {
	return (
		<td className={`border-b border-r border-black px-2 py-1 last:border-r-0 ${className}`}>
			{children || "\u00a0"}
		</td>
	);
}

function InfoLine({ label, value }: { label: string; value: string }) {
	return (
		<p>
			{label} : <span className="font-normal">{value || "\u00a0"}</span>
		</p>
	);
}

function SignatureBox({ label }: { label: string }) {
	return (
		<div className="min-h-28 border-r-2 border-black p-2 text-[11px] font-bold last:border-r-0">
			<p>{label} :</p>
			<div className="mx-auto mt-16 w-3/4 border-b border-black text-center font-normal">
				&nbsp;
			</div>
		</div>
	);
}

function formatQuantity(value: string) {
	const quantity = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

	return formatDeliveryReceiptQuantity(Number.isFinite(quantity) ? quantity : 0);
}

function formatReportDate(value: string) {
	if (!value) {
		return "-";
	}

	try {
		return formatDeliveryReceiptDate(value);
	} catch {
		return value;
	}
}
