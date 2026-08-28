"use client";

import {
	calculateOfficialReceiptTotals,
	formatOfficialReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptFormValues } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import type { ReactNode } from "react";

type OfficialReceiptReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: OfficialReceiptFormValues;
};

export function OfficialReceiptReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
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
			onGeneratePdf={onGeneratePdf}
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
	const receiptAmount = Math.max(totals.credit, totals.debit);
	const paymentType = values.paymentType.toLowerCase();
	const cashAmount = paymentType.includes("cash") ? receiptAmount : 0;
	const checkAmount = paymentType.includes("check") ? receiptAmount : 0;
	const primaryParticular =
		values.remarks ||
		values.lineEntries.find((entry) => entry.collectionType.trim())
			?.collectionType ||
		"-";

	return (
		<div className="mx-auto min-w-[58rem] max-w-[58rem] bg-[#fff] p-5 text-[11px] leading-tight text-[#000] shadow-sm">
			<div className="grid grid-cols-[17rem_1fr] gap-3">
				<table className="h-fit w-full table-fixed border-collapse text-[10px]">
					<tbody>
						<tr>
							<ReceiptCell colSpan={2} className="py-2 text-center font-bold">
								IN PAYMENT OF
							</ReceiptCell>
						</tr>
						<tr>
							<ReceiptCell className="text-center font-bold">PARTICULARS</ReceiptCell>
							<ReceiptCell className="text-center font-bold">AMOUNT</ReceiptCell>
						</tr>
						{createPaymentRows(values, receiptAmount).map((row) => (
							<tr key={row.id}>
								<ReceiptCell className="h-7">{row.particulars}</ReceiptCell>
								<ReceiptCell className="h-7 text-right">{row.amount}</ReceiptCell>
							</tr>
						))}
						<tr>
							<ReceiptCell className="font-bold">TOTAL AMOUNT DUE</ReceiptCell>
							<ReceiptCell className="text-right">
								{formatOfficialReceiptAmount(receiptAmount)}
							</ReceiptCell>
						</tr>
						<tr>
							<ReceiptCell colSpan={2} className="text-center font-bold">
								FORM OF PAYMENT
							</ReceiptCell>
						</tr>
						<tr>
							<ReceiptCell className="font-bold">
								<span className="mr-2 inline-block h-3 w-3 border border-black align-middle" />
								CASH PAYMENT
							</ReceiptCell>
							<ReceiptCell className="text-right">
								{formatOfficialReceiptAmount(cashAmount)}
							</ReceiptCell>
						</tr>
						<tr>
							<ReceiptCell className="font-bold">
								<span className="mr-2 inline-block h-3 w-3 border border-black align-middle" />
								CHECK PAYMENT
							</ReceiptCell>
							<ReceiptCell className="text-right">
								{formatOfficialReceiptAmount(checkAmount)}
							</ReceiptCell>
						</tr>
						<LeftLabelRow label="CHECK NO." />
						<LeftLabelRow label="BANK/BRANCH" />
						<LeftLabelRow label="CHECK DATE" />
					</tbody>
				</table>

				<section className="min-h-[30rem]">
					<div className="grid grid-cols-[7.5rem_1fr] items-start">
						<div className="flex justify-center pt-1">
							<div className="grid h-20 w-20 place-items-center text-center text-[9px] font-bold text-[#16844b]">
								LOGO
							</div>
						</div>
						<div className="text-center">
							<p className="text-base font-bold">
								Your Company Name Here
							</p>
							<p className="mt-1 text-[10px]">VAT REG TIN : 000-000-000-000</p>
							<p className="mt-1 text-[10px]">
								Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District
							</p>
							<p className="mt-4 text-[10px]">
								Telephone No: 0967-237-4514
							</p>
						</div>
					</div>

					<div className="mt-1 grid grid-cols-[1fr_auto] items-end gap-4">
						<h2 className="text-base font-bold">OFFICIAL RECEIPT</h2>
						<div className="text-right text-sm font-bold">
							No. {formatReceiptNo(values.receiptNo)}
						</div>
					</div>

					<div className="mt-4 flex items-end justify-end gap-3">
						<span>Date</span>
						<span className="min-w-36 border-b border-black px-2 text-center">
							{formatAutoReceiptDate()}
						</span>
					</div>

					<ReceiptLine label="Received from" value={values.customerName} />
					<ReceiptLine label="Address" value="" />
					<div className="mt-2 grid grid-cols-[2rem_1fr_7rem_1fr] items-end gap-2">
						<span>TIN:</span>
						<span className="border-b border-black">&nbsp;</span>
						<span>Business Style</span>
						<span className="border-b border-black">&nbsp;</span>
					</div>
					<ReceiptLine
						label="the amount of"
						value={formatAmountInWords(receiptAmount)}
					/>
					<div className="mt-3 flex items-end justify-end gap-3">
						<span className="w-76 border-b border-black">&nbsp;</span>
						<span>( P</span>
						<span className="min-w-36 border-b border-black px-2 text-center">
							{formatOfficialReceiptAmount(receiptAmount)}
						</span>
						<span>)</span>
					</div>
					<div className="mt-8 flex items-end gap-2">
						<span>as partial/full payment of</span>
						<span className="min-w-0 flex-1 border-b border-black px-2 text-center">
							{primaryParticular}
						</span>
					</div>
					<div className="mt-6 border-b border-black">&nbsp;</div>

					<div className="mt-10 flex justify-end">
						<div className="w-44 text-center">
							<p className="border-b border-black px-2">
								{values.status === "Approved" ? "Admin Admin" : "\u00a0"}
							</p>
							<p className="text-[10px]">Authorized Signature</p>
						</div>
					</div>
					<p className="mt-6 text-center text-xs font-bold underline">
						&quot;THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX&quot;
					</p>
				</section>
			</div>
		</div>
	);
}

function ReceiptCell({
	children,
	className = "",
	colSpan,
}: {
	children?: ReactNode;
	className?: string;
	colSpan?: number;
}) {
	return (
		<td className={`border border-black px-1 py-1 ${className}`} colSpan={colSpan}>
			{children}
		</td>
	);
}

function LeftLabelRow({ label }: { label: string }) {
	return (
		<tr>
			<ReceiptCell className="h-7 font-bold">{label}</ReceiptCell>
			<ReceiptCell />
		</tr>
	);
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="mt-3 grid grid-cols-[6rem_1fr] items-end gap-2">
			<span>{label}</span>
			<span className="border-b border-black px-2">{value || "\u00a0"}</span>
		</div>
	);
}

function createPaymentRows(
	values: OfficialReceiptFormValues,
	receiptAmount: number,
) {
	const populatedRows = values.lineEntries
		.filter((entry) => entry.collectionType || entry.referenceNo)
		.map((entry, index) => ({
			id: entry.id,
			particulars: entry.collectionType || entry.referenceNo || "-",
			amount:
				index === 0
					? formatOfficialReceiptAmount(receiptAmount)
					: formatOfficialReceiptAmount(0),
		}));
	const rows = populatedRows.length
		? populatedRows
		: [
				{
					id: "blank-primary-row",
					particulars: "",
					amount: formatOfficialReceiptAmount(receiptAmount),
				},
			];

	return [
		...rows,
		...Array.from({ length: Math.max(0, 7 - rows.length) }, (_, index) => ({
			id: `blank-row-${index}`,
			particulars: "",
			amount: "",
		})),
	].slice(0, 7);
}

function formatReceiptNo(value: string) {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).padStart(6, "0") : value || "-";
}

function formatAutoReceiptDate() {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date());
}

function formatAmountInWords(amount: number) {
	if (!Number.isFinite(amount) || amount <= 0) {
		return "-";
	}

	const roundedAmount = Math.round(amount * 100) / 100;
	const wholePesos = Math.floor(roundedAmount);
	const centavos = Math.round((roundedAmount - wholePesos) * 100);
	const pesoWords = toTitleCase(numberToWords(wholePesos));

	return `${pesoWords} And ${centavos.toString().padStart(2, "0")} / 100`;
}

function numberToWords(value: number): string {
	if (value === 0) {
		return "zero";
	}

	const units = [
		"",
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine",
		"ten",
		"eleven",
		"twelve",
		"thirteen",
		"fourteen",
		"fifteen",
		"sixteen",
		"seventeen",
		"eighteen",
		"nineteen",
	];
	const tens = [
		"",
		"",
		"twenty",
		"thirty",
		"forty",
		"fifty",
		"sixty",
		"seventy",
		"eighty",
		"ninety",
	];
	const scales = ["", "thousand", "million", "billion"];
	const chunks: string[] = [];
	let remaining = Math.floor(value);
	let scaleIndex = 0;

	while (remaining > 0) {
		const chunk = remaining % 1000;

		if (chunk > 0) {
			const chunkWords = convertHundreds(chunk, units, tens);
			const scale = scales[scaleIndex];

			chunks.unshift(scale ? `${chunkWords} ${scale}` : chunkWords);
		}

		remaining = Math.floor(remaining / 1000);
		scaleIndex += 1;
	}

	return chunks.join(" ");
}

function convertHundreds(value: number, units: string[], tens: string[]) {
	const words: string[] = [];
	const hundreds = Math.floor(value / 100);
	const remainder = value % 100;

	if (hundreds > 0) {
		words.push(`${units[hundreds]} hundred`);
	}

	if (remainder > 0) {
		if (remainder < 20) {
			words.push(units[remainder]);
		} else {
			const ten = Math.floor(remainder / 10);
			const unit = remainder % 10;

			words.push(unit ? `${tens[ten]} ${units[unit]}` : tens[ten]);
		}
	}

	return words.join(" ");
}

function toTitleCase(value: string) {
	return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
