import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import {
	formatPurchaseRequestCurrency,
	formatPurchaseRequestDate,
	getPurchaseRequestItemAmount,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PurchaseRequestPrintPreview({
	record,
}: {
	record: PurchaseRequestRecord;
}) {
	const total = getPurchaseRequestTotal(record);

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
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
					onClick={() => window.print()}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Printer className="h-4 w-4" aria-hidden="true" />
					Print
				</button>
			</div>

			<div className="purchase-request-print-stage overflow-x-auto p-4">
				<div className="purchase-request-print-document mx-auto min-h-auto w-198.5 p-8 text-[12px] text-black">
					<div className="border-2 border-black">
						<div className="grid grid-cols-[170px_1fr] gap-3 p-4">
							<div className="flex items-center justify-center">
								<div className="grid h-20 w-24 place-items-center rounded-md bg-skyblue/15 text-center text-[10px] font-bold text-[#1a6290]">
									{record.logoText}
								</div>
							</div>
							<div className="text-center leading-6">
								<div className="text-base font-bold">
									{record.companyName}
								</div>
								<div>VAT REG TIN :{record.vatRegTin}</div>
								<div>{record.companyAddress}</div>
								<div>Telephone No: {record.telephoneNo}</div>
							</div>
						</div>

						<div className="grid grid-cols-[1fr_260px] border-t border-black">
							<div className="px-3 py-2 text-2xl font-black tracking-tight">
								PURCHASE REQUEST
							</div>
							<div className="flex items-end px-3 py-2 font-bold">
								Purchase Request Date:{" "}
								{formatPurchaseRequestDate(record.prDate)}
							</div>
						</div>
						<div className="border-t border-black px-1 py-1">
							<span className="font-bold">Supplier:</span>{" "}
							{record.vceName}
						</div>
						<div className="min-h-24 border-t border-black px-1 py-1">
							<span className="font-bold">FOR:</span>{" "}
							{record.forDepartment}
						</div>

						<table className="w-full border-collapse text-[11px]">
							<thead>
								<tr>
									<PreviewTh>ItemCode</PreviewTh>
									<PreviewTh>BarCode</PreviewTh>
									<PreviewTh>ItemName</PreviewTh>
									<PreviewTh>UOM</PreviewTh>
									<PreviewTh align="right">Cost</PreviewTh>
									<PreviewTh align="right">Qty</PreviewTh>
									<PreviewTh align="right">Amount</PreviewTh>
								</tr>
							</thead>
							<tbody>
								{record.items.map((item) => (
									<tr key={item.id}>
										<PreviewTd>{item.itemCode}</PreviewTd>
										<PreviewTd>{item.barcode}</PreviewTd>
										<PreviewTd>
											{item.description}
										</PreviewTd>
										<PreviewTd>{item.uom}</PreviewTd>
										<PreviewTd align="right">
											{formatPurchaseRequestCurrency(
												item.cost,
											)}
										</PreviewTd>
										<PreviewTd align="right">
											{formatPurchaseRequestCurrency(
												item.quantity,
											)}
										</PreviewTd>
										<PreviewTd align="right">
											{formatPurchaseRequestCurrency(
												getPurchaseRequestItemAmount(
													item,
												),
											)}
										</PreviewTd>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr>
									<td
										colSpan={6}
										className="border border-black px-1 text-right font-bold"
									>
										Total :
									</td>
									<td className="border border-black px-1 text-right font-bold">
										{formatPurchaseRequestCurrency(total)}
									</td>
								</tr>
							</tfoot>
						</table>

						<div className="grid grid-cols-[1fr_1fr_150px] border-t border-black">
							<div className="min-h-14 border-r border-black px-1 py-1">
								Prepared by:
								<div className="mt-6 font-semibold">
									{record.preparedBy}
								</div>
							</div>
							<div className="min-h-14 border-r border-black px-1 py-1">
								Approved by:
								<div className="mt-6 font-semibold">
									{record.approvedBy}
								</div>
							</div>
							<div className="px-2 py-1">
								<div className="font-bold">PR NO.:</div>
								<div className="mt-3 text-right text-2xl font-black">
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

function PreviewTh({
	align = "left",
	children,
}: {
	align?: "left" | "right";
	children: ReactNode;
}) {
	return (
		<th
			className={`border border-black px-1 py-1 font-bold ${
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
}: {
	align?: "left" | "right";
	children: ReactNode;
}) {
	return (
		<td
			className={`border border-black px-1 py-1 ${
				align === "right" ? "text-right" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}
