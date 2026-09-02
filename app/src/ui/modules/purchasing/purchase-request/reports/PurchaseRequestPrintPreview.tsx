import type { ReactNode } from "react";
import {
	formatPurchaseRequestDate,
	formatPurchaseRequestCurrency,
	getPurchaseRequestItemAmount,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { ReportCompanyHeader } from "@/app/src/ui/shared/reports/ReportCompanyHeader";
import { ReportGeneratePdfAction } from "@/app/src/ui/shared/reports/Reports";
import { openPurchaseRequestPdf } from "@/app/src/ui/modules/purchasing/purchase-request/reports/PurchaseRequestPdf";

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
	const hasCost = purchaseRequestReportHasCost(record);
	const hasSupplier = purchaseRequestReportHasSupplier(record);

	const isServices = record.purchaseType?.toLowerCase() === "services";

	return (
		<div className="bg-white">
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
					<ReportGeneratePdfAction
						onGeneratePdf={() => openPurchaseRequestPdf(record)}
					/>
				</div>
			) : null}

			<div className="purchase-request-print-stage overflow-x-auto bg-white p-4">
				<div className="purchase-request-print-document mx-auto min-h-auto w-198.5 bg-white p-4 text-[12px] text-black">
					<div className="border border-black">
						<ReportCompanyHeader
							address={record.companyAddress}
							companyName={record.companyName}
							logoSrc={record.logoImageUrl || "/img/icons/gr8booksneo-logo-wide.png"}
							paddingClassName="p-4"
							telephoneNo={record.telephoneNo}
							vatRegTin={FormatTinNumber(record.vatRegTin)}
						/>

						<div className="grid grid-cols-[1fr_260px] items-end border-t border-black">
							<div className="px-3 py-2 text-2xl font-black tracking-tight">
								PURCHASE REQUEST
							</div>
							<div className="px-3 py-2 text-right font-bold">
								Purchase Request Date:{" "}
								{formatPurchaseRequestDate(record.prDate)}
							</div>
						</div>
						{hasSupplier ? (
							<div className="border-t border-black px-1 py-1">
								<div>
									<span className="font-bold">Supplier:</span>{" "}
									{record.vceName || record.vceCode}
								</div>
							</div>
						) : null}
						<div className="min-h-24 border-t border-black px-1 py-1">
							<span className="font-bold">FOR:</span>{" "}
							{record.forDepartment}
						</div>

						<table className="w-full border-collapse text-[11px]">
							<thead>
								<tr>
									{isServices ? (
										<>
											<PreviewTh edge="left">Description</PreviewTh>
											<PreviewTh align="right">Qty</PreviewTh>
										</>
									) : (
										<>
											<PreviewTh edge="left">ItemCode</PreviewTh>
											<PreviewTh>BarCode</PreviewTh>
											<PreviewTh>ItemName</PreviewTh>
											<PreviewTh>UOM</PreviewTh>
											<PreviewTh align="right">Qty</PreviewTh>
										</>
									)}
									{hasCost ? (
										<>
											<PreviewTh align="right">Cost</PreviewTh>
											<PreviewTh align="right" edge="right">
												Amount
											</PreviewTh>
										</>
									) : null}
								</tr>
							</thead>
							<tbody>
								{record.items.map((item) => (
									<tr key={item.id}>
										{isServices ? (
											<>
												<PreviewTd edge="left">
													{item.description}
												</PreviewTd>
												<PreviewTd align="right">
													{formatPurchaseRequestQuantity(
														item.quantity,
													)}
												</PreviewTd>
											</>
										) : (
											<>
												<PreviewTd edge="left">
													{item.itemCode}
												</PreviewTd>
												<PreviewTd>{item.barcode}</PreviewTd>
												<PreviewTd>
													{item.description}
												</PreviewTd>
												<PreviewTd>{item.uom}</PreviewTd>
												<PreviewTd align="right">
													{formatPurchaseRequestQuantity(
														item.quantity,
													)}
												</PreviewTd>
											</>
										)}
										{hasCost ? (
											<>
												<PreviewTd align="right">
													{formatPurchaseRequestCurrency(item.cost)}
												</PreviewTd>
												<PreviewTd align="right" edge="right">
													{formatPurchaseRequestCurrency(
														getPurchaseRequestItemAmount(item),
													)}
												</PreviewTd>
											</>
										) : null}
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr>
									<td
										colSpan={isServices ? 1 : 4}
										className="border-y border-r border-black px-1 text-right font-bold"
									>
										Total :
									</td>
									<td className="border-y border-r border-black px-1 text-right font-bold">
										{formatPurchaseRequestQuantity(
											totalQuantity,
										)}
									</td>
									{hasCost ? (
										<>
											<td className="border-y border-r border-black px-1 text-right font-bold">
												{formatPurchaseRequestCurrency(totalCost)}
											</td>
											<td className="border-y border-black px-1 text-right font-bold">
												{formatPurchaseRequestCurrency(total)}
											</td>
										</>
									) : null}
								</tr>
							</tfoot>
						</table>

						<div className="grid grid-cols-[1fr_1fr_1fr_150px]">
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
								Checked by:
								<SignatureNameBlock name="" signatureImageUrl="" />
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

function purchaseRequestReportHasCost(
	record: Pick<PurchaseRequestRecord, "items">,
) {
	return record.items.some((item) => Number(item.cost) > 0);
}

function purchaseRequestReportHasSupplier(
	record: Pick<PurchaseRequestRecord, "items" | "vceCode" | "vceName">,
) {
	return (
		purchaseRequestReportHasCost(record) &&
		Boolean(record.vceCode.trim() || record.vceName.trim())
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
	if (edge === "left") {
		return "border-y border-r border-black";
	}

	if (edge === "right") {
		return "border-y border-black";
	}

	return "border border-black";
}
