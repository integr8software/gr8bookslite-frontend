"use client";

import {
	calculateOfficialReceiptTotals,
	formatOfficialReceiptAmount,
	formatOfficialReceiptDate,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptFormValues } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type OfficialReceiptReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	values: OfficialReceiptFormValues;
};

export function OfficialReceiptReportPreview({
	isOpen,
	onClose,
	values,
}: OfficialReceiptReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="official-receipt-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Cash receipt"
			title="Official Receipt Preview"
			description="Review the printable official receipt layout."
			onClose={onClose}
			onPrint={() => window.print()}
		>
			<OfficialReceiptReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

function OfficialReceiptReportDocument({
	values,
}: {
	values: OfficialReceiptFormValues;
}) {
	const totals = calculateOfficialReceiptTotals(values.lineEntries);

	return (
		<div className="mx-auto min-w-[52rem] max-w-4xl rounded-lg border border-darknavy/10 bg-white p-8 text-sm text-darknavy shadow-sm">
			<div className="flex items-start justify-between gap-6 border-b border-darknavy/15 pb-5">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						Cash Receipt
					</p>
					<h2 className="mt-1 text-2xl font-black text-darknavy">
						OFFICIAL RECEIPT
					</h2>
				</div>
				<div className="text-right">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Receipt No.
					</p>
					<p className="text-xl font-black">{values.receiptNo || "-"}</p>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3">
				<ReportField label="Customer" value={values.customerName} />
				<ReportField
					label="Receipt Date"
					value={formatOfficialReceiptDate(values.receiptDate)}
				/>
				<ReportField label="Reference No." value={values.referenceNo} />
				<ReportField label="Payment Type" value={values.paymentType} />
				<ReportField label="Currency" value={values.currency} />
				<ReportField label="Status" value={values.status} />
			</div>

			<table className="mt-7 w-full border-collapse text-xs">
				<thead>
					<tr className="bg-darknavy text-left text-white">
						<th className="border border-darknavy px-2 py-2">Account</th>
						<th className="border border-darknavy px-2 py-2">Collection Type</th>
						<th className="border border-darknavy px-2 py-2">Reference</th>
						<th className="border border-darknavy px-2 py-2 text-right">Debit</th>
						<th className="border border-darknavy px-2 py-2 text-right">Credit</th>
					</tr>
				</thead>
				<tbody>
					{values.lineEntries.map((entry) => (
						<tr key={entry.id}>
							<td className="border border-darknavy/20 px-2 py-2">
								<div className="font-semibold">{entry.accountTitle || "-"}</div>
								<div className="text-darknavy/55">{entry.accountCode}</div>
							</td>
							<td className="border border-darknavy/20 px-2 py-2">
								{entry.collectionType || "-"}
							</td>
							<td className="border border-darknavy/20 px-2 py-2">
								{entry.referenceNo || "-"}
							</td>
							<td className="border border-darknavy/20 px-2 py-2 text-right">
								{entry.debit || "0.00"}
							</td>
							<td className="border border-darknavy/20 px-2 py-2 text-right">
								{entry.credit || "0.00"}
							</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr className="font-bold">
						<td className="border border-darknavy/20 px-2 py-2 text-right" colSpan={3}>
							Total
						</td>
						<td className="border border-darknavy/20 px-2 py-2 text-right">
							{formatOfficialReceiptAmount(totals.debit)}
						</td>
						<td className="border border-darknavy/20 px-2 py-2 text-right">
							{formatOfficialReceiptAmount(totals.credit)}
						</td>
					</tr>
				</tfoot>
			</table>

			<div className="mt-6 rounded-md border border-darknavy/10 bg-offwhite p-4">
				<p className="text-xs font-semibold uppercase text-darknavy/45">
					Remarks
				</p>
				<p className="mt-1 min-h-10">{values.remarks || "-"}</p>
			</div>
		</div>
	);
}

function ReportField({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase text-darknavy/45">{label}</p>
			<p className="mt-1 font-semibold">{value || "-"}</p>
		</div>
	);
}
