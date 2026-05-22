import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import {
	formatPurchaseRequestDate,
	formatPurchaseRequestMoney,
	getPurchaseRequestItemAmount,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { openPurchaseRequestPdf } from "./PurchaseRequestPdf";

export function PurchaseRequestPrintPreview({
	record,
	showControls = true,
}: {
	record: PurchaseRequestRecord;
	showControls?: boolean;
}) {
	const total = getPurchaseRequestTotal(record);
	const totalCost = getPurchaseRequestCostTotal(record);
	const totalQuantity = getPurchaseRequestQuantityTotal(record);

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			{showControls ? (
				<div className="purchase-request-print-controls mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-base font-semibold text-darknavy">
							Print Preview
						</h2>
						<p className="mt-1 text-sm text-darknavy/55">
							Formatted after the purchase request PDF layout.
						</p>
					</div>
					<button
						type="button"
						onClick={() => openPurchaseRequestPdf(record)}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Printer className="h-4 w-4" aria-hidden="true" />
						Print
					</button>
				</div>
			) : null}

			<div className="purchase-request-print-stage overflow-x-auto p-4">
				<div className="purchase-request-print-document mx-auto min-h-auto w-198.5 p-8 text-[12px] text-black">
					<div className="border-2 border-black">
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
									<div className="grid h-20 w-24 place-items-center rounded-md bg-skyblue/15 text-center text-[10px] font-bold text-[#1a6290]">
										Logo
									</div>
								)}
							</div>
							<div className="text-center leading-6">
								<div className="text-base font-bold">
									{record.companyName}
								</div>
								<div>VAT REG TIN :{FormatTinNumber(record.vatRegTin)}</div>
								<div>{record.companyAddress}</div>
								<div>Telephone No: {record.telephoneNo}</div>
							</div>
						</div>

						<div className="border-t border-black">
							<div className="px-3 py-2 text-2xl font-black tracking-tight">
								PURCHASE REQUEST
							</div>
						</div>
						<div className="flex justify-between gap-4 border-t border-black px-1 py-1">
							<div>
								<span className="font-bold">Supplier:</span>{" "}
								{record.vceName}
							</div>
							<div className="shrink-0 font-bold">
								Purchase Request Date:{" "}
								{formatPurchaseRequestDate(record.prDate)}
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
									<PreviewTh align="right">Cost</PreviewTh>
									<PreviewTh align="right">Qty</PreviewTh>
									<PreviewTh align="right" edge="right">Amount</PreviewTh>
								</tr>
							</thead>
							<tbody>
								{record.items.map((item) => (
									<tr key={item.id}>
										<PreviewTd edge="left">{item.itemCode}</PreviewTd>
										<PreviewTd>{item.barcode}</PreviewTd>
										<PreviewTd>
											{item.description}
										</PreviewTd>
										<PreviewTd>{item.uom}</PreviewTd>
										<PreviewTd align="right">
											{formatPurchaseRequestMoney(
												item.cost,
												record.currency,
											)}
										</PreviewTd>
										<PreviewTd align="right">
											{formatPurchaseRequestQuantity(item.quantity)}
										</PreviewTd>
										<PreviewTd align="right" edge="right">
											{formatPurchaseRequestMoney(
												getPurchaseRequestItemAmount(
													item,
												),
												record.currency,
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
										{formatPurchaseRequestMoney(totalCost, record.currency)}
									</td>
									<td className="border-y border-r border-black px-1 text-right font-bold">
										{formatPurchaseRequestQuantity(totalQuantity)}
									</td>
									<td className="border-y border-black px-1 text-right font-bold">
										{formatPurchaseRequestMoney(total, record.currency)}
									</td>
								</tr>
							</tfoot>
						</table>

						<div className="grid grid-cols-[1fr_1fr_150px]">
							<div className="min-h-14 border-r border-black px-1 py-1">
								Prepared by:
								<SignatureNameBlock
									name={record.preparedBy}
									signatureImageUrl={record.preparedBySignatureImageUrl}
								/>
							</div>
							<div className="min-h-14 border-r border-black px-1 py-1">
								Approved by:
								<SignatureNameBlock
									name={record.approvedBy}
									signatureImageUrl={record.approvedBySignatureImageUrl}
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

function getPurchaseRequestCostTotal(
	record: Pick<PurchaseRequestRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.cost) || 0),
		0,
	);
}

function getPurchaseRequestQuantityTotal(
	record: Pick<PurchaseRequestRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.quantity) || 0),
		0,
	);
}

function formatPurchaseRequestQuantity(quantity: number) {
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
