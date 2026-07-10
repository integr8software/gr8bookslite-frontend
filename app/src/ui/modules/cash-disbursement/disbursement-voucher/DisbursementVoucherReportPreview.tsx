"use client";

import {
	formatCurrency,
	formatDateLabel,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type DisbursementVoucherReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	values: DisbursementVoucherFormValues;
};

export function DisbursementVoucherReportPreview({
	isOpen,
	onClose,
	values,
}: DisbursementVoucherReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="disbursement-voucher-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Cash disbursement"
			title="Disbursement Voucher Preview"
			description="Review the printable disbursement voucher layout."
			onClose={onClose}
			onPrint={() => window.print()}
		>
			<DisbursementVoucherReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

function DisbursementVoucherReportDocument({
	values,
}: {
	values: DisbursementVoucherFormValues;
}) {
	const totalDebit = values.lineEntries.reduce(
		(total, entry) => total + entry.debit,
		0,
	);
	const totalCredit = values.lineEntries.reduce(
		(total, entry) => total + entry.credit,
		0,
	);

	return (
		<div className="mx-auto min-w-[56rem] max-w-5xl rounded-lg border border-darknavy/10 bg-white p-8 text-sm text-darknavy shadow-sm">
			<div className="flex items-start justify-between gap-6 border-b border-darknavy/15 pb-5">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						Cash Disbursement
					</p>
					<h2 className="mt-1 text-2xl font-black text-darknavy">
						DISBURSEMENT VOUCHER
					</h2>
				</div>
				<div className="text-right">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Voucher No.
					</p>
					<p className="text-xl font-black">{values.voucherNo || "-"}</p>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-3">
				<ReportField label="Payee" value={values.vceName} />
				<ReportField
					label="Voucher Date"
					value={formatDateLabel(values.voucherDate)}
				/>
				<ReportField label="Payment Method" value={values.paymentMethod} />
				<ReportField label="Reference Module" value={values.referenceModule} />
				<ReportField label="Reference No." value={values.voucherReferenceNo} />
				<ReportField label="Status" value={values.status} />
				<ReportField label="Currency" value={values.currency} />
				<ReportField label="FX Rate" value={values.fxRate} />
				<ReportField label="Cost Center" value={values.costCenter} />
			</div>

			<table className="mt-7 w-full border-collapse text-xs">
				<thead>
					<tr className="bg-darknavy text-left text-white">
						<th className="border border-darknavy px-2 py-2">Account</th>
						<th className="border border-darknavy px-2 py-2">Party</th>
						<th className="border border-darknavy px-2 py-2">Particulars</th>
						<th className="border border-darknavy px-2 py-2 text-right">Debit</th>
						<th className="border border-darknavy px-2 py-2 text-right">Credit</th>
					</tr>
				</thead>
				<tbody>
					{values.lineEntries.map((entry) => (
						<tr key={entry.id}>
							<td className="border border-darknavy/20 px-2 py-2">
								<div className="font-semibold">{entry.accountName || "-"}</div>
								<div className="text-darknavy/55">{entry.accountCode}</div>
							</td>
							<td className="border border-darknavy/20 px-2 py-2">
								{entry.partyName || entry.partyCode || "-"}
							</td>
							<td className="border border-darknavy/20 px-2 py-2">
								{entry.particulars || "-"}
							</td>
							<td className="border border-darknavy/20 px-2 py-2 text-right">
								{formatCurrency(entry.debit)}
							</td>
							<td className="border border-darknavy/20 px-2 py-2 text-right">
								{formatCurrency(entry.credit)}
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
							{formatCurrency(totalDebit)}
						</td>
						<td className="border border-darknavy/20 px-2 py-2 text-right">
							{formatCurrency(totalCredit)}
						</td>
					</tr>
				</tfoot>
			</table>

			<div className="mt-6 grid grid-cols-2 gap-4">
				<div className="rounded-md border border-darknavy/10 bg-offwhite p-4">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Remarks
					</p>
					<p className="mt-1 min-h-10">{values.remarks || "-"}</p>
				</div>
				<div className="rounded-md border border-darknavy/10 bg-offwhite p-4">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Prepared By
					</p>
					<p className="mt-1 font-semibold">{values.preparedBy || "-"}</p>
				</div>
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
