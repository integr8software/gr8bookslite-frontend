import type { ReactNode } from "react";
import {
	formatSalesQuotationDate,
	formatSalesQuotationCurrency,
	getSalesQuotationItemAmount,
	getSalesQuotationTotal,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { ReportGeneratePdfAction } from "@/app/src/ui/shared/reports/Reports";
import { openSalesQuotationPdf } from "@/app/src/ui/modules/sales/sales-quotation/SalesQuotationPdf";

export function SalesQuotationPrintPreview({
	record,
	showControls = true,
}: {
	record: SalesQuotationRecord;
	showControls?: boolean;
}) {
	const total = getSalesQuotationTotal(record);
	const totalItemPrice = getSalesQuotationItemPriceTotal(record);
	const totalQuantity = getSalesQuotationQuantityTotal(record);

	return (
		<div className="bg-white">
			{showControls ? (
				<div className="sales-quotation-print-controls mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-base font-semibold text-darknavy">
							Print Preview
						</h2>
						<p className="mt-1 text-sm text-darknavy/55">
							Formatted after the sales quotation PDF layout.
						</p>
					</div>
					<ReportGeneratePdfAction
						onGeneratePdf={() => openSalesQuotationPdf(record)}
					/>
				</div>
			) : null}

			<div className="sales-quotation-print-stage overflow-x-auto bg-white p-4">
				<div className="sales-quotation-print-document mx-auto min-h-auto w-198.5 bg-white p-4 text-[12px] text-black">
					<div className="border border-black">
						<div className="grid grid-cols-[170px_1fr] gap-3 p-4">
							<div className="flex items-center justify-center">
								{record.logoImageUrl ? (
									// User-uploaded data URLs should use a plain img element.
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={record.logoImageUrl}
										alt="Company logo"
										className="h-20 w-24 object-contain"
									/>
								) : (
									<div className="grid h-20 w-24 place-items-center text-left text-[24px] font-bold leading-5 text-[#0b56b3]">
										gr8books
									</div>
								)}
							</div>
							<div className="text-center leading-6">
								<div className="text-base font-bold">
									{record.companyName}
								</div>
								<div>
									VAT REG TIN :
									{FormatTinNumber(record.vatRegTin)}
								</div>
								<div>{record.companyAddress}</div>
								<div>Telephone No: {record.telephoneNo}</div>
							</div>
						</div>

						<div className="grid grid-cols-[1fr_260px] items-end border-t border-black">
							<div className="px-3 py-2 text-2xl font-black tracking-tight">
								SALES QUOTATION
							</div>
							<div className="px-3 py-2 text-right font-bold">
								Sales Quotation Date:{" "}
								{formatSalesQuotationDate(record.prDate)}
							</div>
						</div>
						<div className="border-t border-black px-1 py-1">
							<div>
								<span className="font-bold">Party:</span>{" "}
								{record.partyName}
							</div>
						</div>
						<div className="min-h-24 border-t border-black px-1 py-1">
							<span className="font-bold">FOR:</span>{" "}
							{record.forDepartment}
						</div>

						<table className="w-full border-collapse text-[11px]">
							<thead>
								<tr>
									<PreviewTh edge="left">ItemCode</PreviewTh>
									<PreviewTh>BarCode</PreviewTh>
									<PreviewTh>ItemName</PreviewTh>
									<PreviewTh>UOM</PreviewTh>
									<PreviewTh align="right">Qty</PreviewTh>
									<PreviewTh align="right">Item Price</PreviewTh>
									<PreviewTh align="right" edge="right">
										Amount
									</PreviewTh>
								</tr>
							</thead>
							<tbody>
								{record.items.map((item) => (
									<tr key={item.id}>
										<PreviewTd edge="left">
											{item.itemCode}
										</PreviewTd>
										<PreviewTd>{item.barcode}</PreviewTd>
										<PreviewTd>
											{item.itemName}
										</PreviewTd>
										<PreviewTd>{item.uom}</PreviewTd>
										<PreviewTd align="right">
											{formatSalesQuotationQuantity(
												item.quantity,
											)}
										</PreviewTd>
										<PreviewTd align="right">
											{formatSalesQuotationCurrency(item.itemPrice)}
										</PreviewTd>
										<PreviewTd align="right" edge="right">
											{formatSalesQuotationCurrency(
												getSalesQuotationItemAmount(item),
											)}
										</PreviewTd>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr>
									<td
										colSpan={4}
										className="border-y border-r border-black px-1 text-right font-bold"
									>
										Total :
									</td>
									<td className="border-y border-r border-black px-1 text-right font-bold">
										{formatSalesQuotationQuantity(
											totalQuantity,
										)}
									</td>
									<td className="border-y border-r border-black px-1 text-right font-bold">
										{formatSalesQuotationCurrency(totalItemPrice)}
									</td>
									<td className="border-y border-black px-1 text-right font-bold">
										{formatSalesQuotationCurrency(total)}
									</td>
								</tr>
							</tfoot>
						</table>

						<div className="grid grid-cols-[1fr_1fr_150px]">
							<div className="min-h-16 border-r border-black px-1 py-1">
								{record.preparedByLabel || "Prepared by"}:
								<SignatureNameBlock
									name={record.preparedBy}
									signatureImageUrl={
										record.preparedBySignatureImageUrl
									}
								/>
							</div>
							<div className="min-h-16 border-r border-black px-1 py-1">
								{record.approvedByLabel || "Approved by"}:
								<SignatureNameBlock
									name={record.approvedBy}
									signatureImageUrl={
										record.approvedBySignatureImageUrl
									}
								/>
							</div>
							<div className="px-2 py-1">
								<div className="font-bold">PR NO.:</div>
								<div className="mt-3 break-all text-right text-[clamp(14px,2.8vw,24px)] font-black leading-tight">
									{record.transNo}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function SignatureNameBlock({
	name,
	signatureImageUrl,
}: {
	name: string;
	signatureImageUrl: string;
}) {
	return (
		<div className="relative mt-6 flex h-8 items-end justify-center">
			{signatureImageUrl ? (
				// User-uploaded data URLs should use a plain img element.
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={signatureImageUrl}
					alt=""
					className="absolute bottom-0 h-10 max-w-40 object-contain opacity-85"
				/>
			) : null}
			<div className="relative z-10 font-bold">{name}</div>
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

function getSalesQuotationItemPriceTotal(
	record: Pick<SalesQuotationRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.itemPrice) || 0),
		0,
	);
}

function getSalesQuotationQuantityTotal(
	record: Pick<SalesQuotationRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.quantity) || 0),
		0,
	);
}

function formatSalesQuotationQuantity(quantity: number) {
	return Math.trunc(Number(quantity) || 0).toLocaleString("en-US");
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
	if (edge === "left") {
		return "border-y border-r border-black";
	}

	if (edge === "right") {
		return "border-y border-black";
	}

	return "border border-black";
}
