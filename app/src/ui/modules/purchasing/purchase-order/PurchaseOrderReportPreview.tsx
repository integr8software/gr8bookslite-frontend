"use client";

import type { ReactNode } from "react";
import {
	formatPurchaseOrderAmount,
	formatPurchaseOrderDate,
	getPurchaseOrderItemGrossAmount,
	getPurchaseOrderItemNetAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type {
	PurchaseOrderFormValues,
	PurchaseOrderRecord,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { openPurchaseOrderPdf } from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderPdf";

type PurchaseOrderReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	record: PurchaseOrderRecord;
};

export function PurchaseOrderReportPreview({
	isOpen,
	onClose,
	record,
}: PurchaseOrderReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="purchase-order-preview-drawer"
			isOpen={isOpen}
			eyebrow="Purchasing document"
			title="Print Preview"
			description="Review the printable purchase order layout."
			onClose={onClose}
			onGeneratePdf={() => openPurchaseOrderPdf(record)}
		>
			<PurchaseOrderReportDocument values={record} />
		</ReportPreviewDrawer>
	);
}

export function PurchaseOrderReportDocument({
	values,
}: {
	values: PurchaseOrderFormValues;
}) {
	const totals = getPurchaseOrderTotals(values);

	return (
		<div className="overflow-x-auto bg-white p-4">
			<div className="mx-auto w-198.5 bg-white p-4 text-[12px] text-black">
				<div className="border border-black">
					<div className="grid grid-cols-[170px_1fr] gap-3 p-4">
						<div className="flex items-center justify-center">
							<div className="grid h-20 w-24 place-items-center text-left text-[24px] font-bold leading-5 text-[#0b56b3]">
								gr8books
							</div>
						</div>
						<div className="text-center leading-6">
							<div className="text-base font-bold">
								Your Company Name Here
							</div>
							<div className="font-bold">
								VAT REG TIN :000-000-000
							</div>
							<div className="font-bold">
								Abc, 123, Sample, Malamig, City Of Mandaluyong,
								Ncr, Second District
							</div>
							<div className="font-bold">
								Telephone No: 0967-237-4514
							</div>
						</div>
					</div>
					<div className="grid grid-cols-[1fr_260px] items-end border-t border-black">
						<div className="px-3 py-2 text-2xl font-black tracking-tight">
							PURCHASE ORDER
						</div>
						<div className="px-3 py-2 text-right font-bold">
							Purchase Order Date:{" "}
							{formatPurchaseOrderDate(values.documentDate)}
						</div>
					</div>
					<div className="grid grid-cols-[1fr_260px] border-t border-black">
						<ReportInfoCell label="Supplier" value={values.vceName} />
						<ReportInfoCell
							label="Delivery Date"
							value={formatPurchaseOrderDate(values.deliveryDate)}
						/>
					</div>
					<div className="grid grid-cols-[1fr_260px] border-t border-black">
						<ReportInfoCell label="Address" value={values.address} />
						<ReportInfoCell label="Contact No" value={values.contactNo} />
					</div>
					<div className="min-h-24 border-t border-black px-1 py-1">
						<span className="font-bold">FOR:</span>
					</div>
					<table className="w-full border-collapse text-[11px]">
						<thead>
							<tr>
								<PreviewTh edge="left">ItemCode</PreviewTh>
								<PreviewTh>BarCode</PreviewTh>
								<PreviewTh>ItemName</PreviewTh>
								<PreviewTh>UOM</PreviewTh>
								<PreviewTh align="right">Cost</PreviewTh>
								<PreviewTh align="right">Qty</PreviewTh>
								<PreviewTh align="right">Gross</PreviewTh>
								<PreviewTh align="right">VAT</PreviewTh>
								<PreviewTh align="right" edge="right">
									Net
								</PreviewTh>
							</tr>
						</thead>
						<tbody>
							{values.items.map((item) => (
								<tr key={item.id}>
									<PreviewTd edge="left">{item.itemCode}</PreviewTd>
									<PreviewTd>{item.barcode}</PreviewTd>
									<PreviewTd>{item.itemName}</PreviewTd>
									<PreviewTd>{item.uom}</PreviewTd>
									<PreviewTd align="right">
										{formatPurchaseOrderAmount(item.cost)}
									</PreviewTd>
									<PreviewTd align="right">
										{formatPurchaseOrderAmount(item.quantity)}
									</PreviewTd>
									<PreviewTd align="right">
										{formatPurchaseOrderAmount(
											getPurchaseOrderItemGrossAmount(item),
										)}
									</PreviewTd>
									<PreviewTd align="right">
										{formatPurchaseOrderAmount(item.vatAmount)}
									</PreviewTd>
									<PreviewTd align="right" edge="right">
										{formatPurchaseOrderAmount(
											getPurchaseOrderItemNetAmount(item),
										)}
									</PreviewTd>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td
									colSpan={6}
									className="border-y border-r border-black px-1 text-right font-bold"
								>
									Total :
								</td>
								<td className="border-y border-r border-black px-1 text-right font-bold">
									{formatPurchaseOrderAmount(totals.grossAmount)}
								</td>
								<td className="border-y border-r border-black px-1 text-right font-bold">
									{formatPurchaseOrderAmount(totals.vatAmount)}
								</td>
								<td className="border-y border-black px-1 text-right font-bold">
									{formatPurchaseOrderAmount(totals.netAmount)}
								</td>
							</tr>
						</tfoot>
					</table>
					<div className="grid grid-cols-[1fr_1fr_1fr_150px]">
						<SignatureCell label="Prepared by" />
						<SignatureCell label="Approved by" />
						<SignatureCell label="Conforme" />
						<div className="px-2 py-1">
							<div className="font-bold">PO NO.:</div>
							<div className="mt-3 break-all text-right text-[24px] font-black leading-tight">
								{formatPurchaseOrderNumber(values.transNo)}
							</div>
						</div>
					</div>
				</div>
				<div className="mt-2 border-t-2 border-black" />
				<div className="mt-5 border-t-2 border-black" />
			</div>
		</div>
	);
}

function ReportInfoCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-r border-black px-1 py-1 last:border-r-0">
			<span className="font-bold">{label}:</span> {value}
		</div>
	);
}

function SignatureCell({ label }: { label: string }) {
	return (
		<div className="min-h-14 border-r border-black px-1 py-1">
			{label}:
		</div>
	);
}

function PreviewTh({
	align = "left",
	children,
	edge,
}: {
	align?: "left" | "right";
	children: ReactNode;
	edge?: "left" | "right";
}) {
	return (
		<th
			className={`${getPreviewCellBorderClassName(edge)} px-1 py-1 font-bold ${
				align === "right" ? "text-right" : "text-left"
			}`}
		>
			{children}
		</th>
	);
}

function PreviewTd({
	align = "left",
	children,
	edge,
}: {
	align?: "left" | "right";
	children: ReactNode;
	edge?: "left" | "right";
}) {
	return (
		<td
			className={`${getPreviewCellBorderClassName(edge)} px-1 py-1 ${
				align === "right" ? "text-right" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}

function getPreviewCellBorderClassName(edge?: "left" | "right") {
	if (edge === "left") return "border-y border-r border-black";
	if (edge === "right") return "border-y border-black";

	return "border border-black";
}

export function formatPurchaseOrderNumber(value: string) {
	const numeric = value.replace(/\D/g, "");

	return (numeric || value || "0").padStart(6, "0").slice(-6);
}
