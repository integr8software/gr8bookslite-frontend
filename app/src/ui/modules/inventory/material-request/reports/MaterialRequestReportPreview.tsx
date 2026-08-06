"use client";

import Image from "next/image";
import {
	formatMaterialRequestDate,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestFormValues,
	MaterialRequestItem,
	MaterialRequestNumberValue,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { openMaterialRequestPdf } from "@/app/src/ui/modules/inventory/material-request/reports/MaterialRequestPdf";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type MaterialRequestReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	values: MaterialRequestFormValues;
};

export function MaterialRequestReportPreview({
	isOpen,
	onClose,
	values,
}: MaterialRequestReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="material-request-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Material Request Preview"
			description="Review the printable material request layout."
			onClose={onClose}
			onGeneratePdf={() => openMaterialRequestPdf(values)}
		>
			<MaterialRequestReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

function MaterialRequestReportDocument({
	values,
}: {
	values: MaterialRequestFormValues;
}) {
	const rows = createMaterialRequestPreviewRows(values.items);
	const shouldShowStockQuantity = hasStockQuantity(values.items);

	return (
		<div className="mx-auto w-full max-w-[58rem] bg-white p-2 text-[10px] font-semibold leading-tight text-black shadow-sm print:p-0 print:shadow-none">
			<div className="border-2 border-black">
				<div className="grid grid-cols-[11rem_1fr_11rem] items-start px-8 pb-2 pt-3">
					<div>
						<Image
							src="/img/icons/gr8booksneo-logo-wide.png"
							alt="Company logo"
							width={130}
							height={88}
							className="h-[88px] w-[130px] object-contain"
						/>
					</div>
					<div className="text-center">
						<p className="text-base font-bold">Your Company Name Here</p>
						<p className="mt-1">VAT REG TIN : 000-000-000</p>
						<p className="mt-1 uppercase">
							ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District
						</p>
						<p className="mt-2">Telephone No: 0967-237-4514</p>
					</div>
					<div />
				</div>

				<div className="px-5 pb-2">
					<h2 className="text-left text-xl font-black uppercase leading-none">
						Material Request
					</h2>
				</div>

				<div className="grid grid-cols-[1.75fr_1fr] border-t-2 border-black">
					<RequestInfoCell label="Warehouse" value={values.toWarehouse} />
					<RequestInfoCell label="Date" value={formatMaterialRequestDate(values.documentDate)} />
					<RequestInfoCell label="Requestor" value={values.department || values.vceName} />
					<RequestInfoCell label="Required Date" value={formatMaterialRequestDate(values.requiredDate)} />
				</div>

				<div className="min-h-16 border-t-2 border-black px-2 py-2">
					<p className="font-bold">Purpose</p>
					<p className="mt-2 font-normal">{values.purpose || values.remarks || "\u00a0"}</p>
				</div>

				<table className="w-full border-collapse border-t-2 border-black text-[10px]">
					<thead>
						<tr>
							<ReportHeaderCell className="w-[14%]">Item Code</ReportHeaderCell>
							<ReportHeaderCell>Item Name</ReportHeaderCell>
							<ReportHeaderCell className="w-[12%] text-center">UOM</ReportHeaderCell>
							<ReportHeaderCell className="w-[14%] text-right">Req QTY</ReportHeaderCell>
							{shouldShowStockQuantity ? (
								<ReportHeaderCell className="w-[14%] text-right">Stock QTY</ReportHeaderCell>
							) : null}
						</tr>
					</thead>
					<tbody>
						{rows.map((item, index) => (
							<tr key={`${item.itemCode}-${item.itemName}-${index}`}>
								<ReportCell>{item.itemCode}</ReportCell>
								<ReportCell>{item.itemName}</ReportCell>
								<ReportCell className="text-center">{item.uom}</ReportCell>
								<ReportCell className="text-right">{item.requestQuantity}</ReportCell>
								{shouldShowStockQuantity ? (
									<ReportCell className="text-right">{item.stockQuantity}</ReportCell>
								) : null}
							</tr>
						))}
					</tbody>
				</table>

				<div className="grid grid-cols-[1fr_1fr_1fr_8rem] border-t-2 border-black">
					<SignatureBlock label="Prepared by" />
					<SignatureBlock label="Checked by" />
					<SignatureBlock label="Approved by" />
					<RequestNumberBlock requestNo={values.requestNo} />
				</div>
			</div>
		</div>
	);
}

function RequestInfoCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-b border-r-2 border-black px-2 py-2 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
			{label} : <span className="ml-8 font-normal">{value || "\u00a0"}</span>
		</div>
	);
}

function ReportHeaderCell({
	children,
	className = "",
}: {
	children: string;
	className?: string;
}) {
	return (
		<th
			className={`border-b border-r-2 border-black px-2 py-1 font-bold last:border-r-0 ${className}`}
		>
			{children}
		</th>
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
		<td
			className={`border-b border-r-2 border-black px-2 py-1 font-normal last:border-r-0 ${className}`}
		>
			{children || "\u00a0"}
		</td>
	);
}

function SignatureBlock({ label }: { label: string }) {
	return (
		<div className="min-h-16 border-r-2 border-black px-2 py-2 font-normal last:border-r-0">
			{label}:
		</div>
	);
}

function RequestNumberBlock({ requestNo }: { requestNo: string }) {
	return (
		<div className="grid min-h-16 grid-rows-[auto_1fr] border-r-2 border-black px-2 py-2 text-right font-normal last:border-r-0">
			<p className="text-left text-[9px] font-bold">MR No.:</p>
			<p className="self-end text-xl font-black tracking-wide">
				{formatRequestNo(requestNo)}
			</p>
		</div>
	);
}

function createMaterialRequestPreviewRows(items: MaterialRequestItem[]) {
	const populatedRows = items
		.filter((item) => item.itemCode || item.itemName)
		.map((item) => ({
			itemCode: item.itemCode,
			itemName: item.itemName || item.description,
			requestQuantity: formatQuantity(item.requestQuantity),
			stockQuantity: formatQuantity(item.stockQuantity),
			uom: item.uom,
		}));

	return populatedRows.length
		? populatedRows
		: [
				{
					itemCode: "",
					itemName: "",
					requestQuantity: "",
					stockQuantity: "",
					uom: "",
				},
			];
}

function hasStockQuantity(items: MaterialRequestItem[]) {
	return items.some((item) => item.stockQuantity !== "" && Number(item.stockQuantity) > 0);
}

function formatQuantity(value: MaterialRequestNumberValue) {
	if (value === "") {
		return "";
	}

	return Number(value).toLocaleString("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	});
}

function formatRequestNo(value: string) {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).replace(/^0+/, "") || "0" : value || "-";
}
