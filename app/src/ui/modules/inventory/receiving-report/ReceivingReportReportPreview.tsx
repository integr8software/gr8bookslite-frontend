"use client";

import Image from "next/image";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

export type ReceivingReportReportLine = {
	id: string;
	barcode: string;
	description: string;
	uom: string;
	cost: string;
	poQty: string;
	rrQty: string;
	grossAmount: string;
	vatAmount: string;
	ewtAmount: string;
	netAmount: string;
};

export type ReceivingReportReportValues = {
	address: string;
	contactNo: string;
	deliveryDate: string;
	documentDate: string;
	lines: ReceivingReportReportLine[];
	transNo: string;
	vceCode: string;
	vceName: string;
};

export type ReceivingReportReportTotals = {
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
};

type ReceivingReportReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	totals: ReceivingReportReportTotals;
	values: ReceivingReportReportValues;
};

export function ReceivingReportReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	totals,
	values,
}: ReceivingReportReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="receiving-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Receiving Report Preview"
			description="Review the printable receiving report layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<ReceivingReportReportDocument values={values} totals={totals} />
		</ReportPreviewDrawer>
	);
}

export function ReceivingReportReportDocument({
	totals,
	values,
}: {
	totals: ReceivingReportReportTotals;
	values: ReceivingReportReportValues;
}) {
	const rows = createReceivingReportReportRows(values);

	return (
		<div className="mx-auto w-full max-w-[58rem] bg-white p-2 text-[10px] font-semibold leading-tight text-black shadow-sm print:p-0 print:shadow-none">
			<div className="border-2 border-black">
				<div className="grid grid-cols-[11rem_1fr_11rem] items-start px-8 pb-5 pt-4">
					<div>
						<Image
							src="/img/icons/gr8booksneo-logo-wide.png"
							alt="Company logo"
							width={130}
							height={88}
							className="h-[88px] w-[130px] object-contain"
						/>
					</div>
					<div className="pt-1 text-center">
						<p className="text-base font-bold">Your Company Name Here</p>
						<p className="mt-3">VAT REG TIN : 000-000-000</p>
						<p className="mt-3">
							Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District
						</p>
						<p className="mt-5">Telephone No: 0967-237-4514</p>
					</div>
					<div />
				</div>

				<div className="grid grid-cols-[1fr_20rem] items-end border-b-2 border-black px-3 pb-2">
					<h2 className="text-[25px] font-black uppercase leading-none">
						Receiving Report
					</h2>
					<p className="pb-0.5 font-bold">
						Receiving Report Date: {formatReportDate(values.documentDate)}
					</p>
				</div>

				<div className="grid grid-cols-[2fr_1.08fr] border-b-2 border-black">
					<ReportInfoCell label="Supplier" value={values.vceName || values.vceCode} />
					<ReportInfoCell label="Delivery Date" value={formatReportDate(values.deliveryDate)} />
					<ReportInfoCell label="Address" value={values.address} />
					<ReportInfoCell label="Contact No" value={values.contactNo} />
				</div>

				<div className="min-h-[6.5rem] border-b-2 border-black px-2 py-2 font-bold">
					FOR:
				</div>

				<table className="w-full border-collapse text-[10px]">
					<thead>
						<tr>
							<ReportHeaderCell className="w-[8%]">BarCode</ReportHeaderCell>
							<ReportHeaderCell className="w-[23%]">ItemName</ReportHeaderCell>
							<ReportHeaderCell className="w-[5%] text-center">UOM</ReportHeaderCell>
							<ReportHeaderCell className="w-[11%] text-right">Cost</ReportHeaderCell>
							<ReportHeaderCell className="w-[6%] text-right">PO Qty</ReportHeaderCell>
							<ReportHeaderCell className="w-[6%] text-right">RR Qty</ReportHeaderCell>
							<ReportHeaderCell className="w-[14%] text-right">Gross</ReportHeaderCell>
							<ReportHeaderCell className="w-[14%] text-right">VAT</ReportHeaderCell>
							<ReportHeaderCell className="text-right">Net</ReportHeaderCell>
						</tr>
					</thead>
					<tbody>
						{rows.map((line, index) => (
							<tr key={`${line.barcode}-${line.description}-${index}`}>
								<ReportCell>{line.barcode}</ReportCell>
								<ReportCell>{line.description}</ReportCell>
								<ReportCell className="text-center">{line.uom}</ReportCell>
								<ReportCell className="text-right">{line.cost}</ReportCell>
								<ReportCell className="text-right">{line.poQty}</ReportCell>
								<ReportCell className="text-right">{line.rrQty}</ReportCell>
								<ReportCell className="text-right">{line.grossAmount}</ReportCell>
								<ReportCell className="text-right">{line.vatAmount}</ReportCell>
								<ReportCell className="text-right">{line.netAmount}</ReportCell>
							</tr>
						))}
					</tbody>
				</table>

				<div className="grid grid-cols-[1fr_14rem] border-b-2 border-black">
					<div className="min-h-[6.5rem]" />
					<div className="grid border-l-2 border-black text-[10px] font-bold">
						<ReportTotalRow label="Gross Amount" value={totals.grossAmount} />
						<ReportTotalRow label="VAT Amount" value={totals.vatAmount} />
						<ReportTotalRow label="EWT Amount" value={totals.ewtAmount} />
						<ReportTotalRow label="Net Amount" value={totals.netAmount} />
					</div>
				</div>

				<div className="grid grid-cols-[1fr_1fr_9rem]">
					<SignatureBlock label="Prepared by" />
					<SignatureBlock label="Approved by" />
					<div className="min-h-[4.3rem] border-l-2 border-black p-1 font-bold">
						<p>RR NO.:</p>
						<p className="mt-4 text-right text-2xl font-black">
							{formatReportCode(values.transNo)}
						</p>
					</div>
				</div>
			</div>
			<div className="mt-2 border-t-2 border-black pt-5">
				<div className="border-t-2 border-black" />
			</div>
		</div>
	);
}

function ReportInfoCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-b border-r-2 border-black px-1 py-1 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
			{label}: <span className="font-normal">{value || "\u00a0"}</span>
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
			className={`border-b-2 border-r-2 border-black px-1 py-0.5 text-left font-bold last:border-r-0 ${className}`}
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
			className={`border-b border-r-2 border-black px-1 py-1 font-normal last:border-r-0 ${className}`}
		>
			{children || "\u00a0"}
		</td>
	);
}

function ReportTotalRow({ label, value }: { label: string; value: number }) {
	return (
		<div className="grid grid-cols-[1fr_6.5rem]">
			<div className="px-1 py-1 text-right">{label} :</div>
			<div className="px-1 py-1 text-right">{formatReportNumberAmount(value)}</div>
		</div>
	);
}

function SignatureBlock({ label }: { label: string }) {
	return (
		<div className="min-h-[4.3rem] border-r-2 border-black p-1 font-normal">
			{label}:
		</div>
	);
}

export function createReceivingReportReportRows(values: ReceivingReportReportValues) {
	return values.lines
		.filter((line) =>
			[
				line.barcode,
				line.description,
				line.uom,
				line.cost,
				line.poQty,
				line.rrQty,
				line.grossAmount,
				line.vatAmount,
				line.netAmount,
			].some((value) => value.trim()),
		)
		.map((line) => ({
			barcode: line.barcode,
			description: line.description,
			uom: line.uom,
			cost: formatReportAmount(line.cost),
			poQty: formatReportQuantity(line.poQty),
			rrQty: formatReportQuantity(line.rrQty),
			grossAmount: formatReportAmount(line.grossAmount),
			vatAmount: formatReportAmount(line.vatAmount),
			netAmount: formatReportAmount(line.netAmount),
		}));
}

export function formatReportDate(value: string) {
	if (!value) {
		return "";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

export function formatReportCode(value: string) {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).padStart(6, "0") : "000400";
}

export function formatReportNumberAmount(value: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0);
}

function formatReportAmount(value: string) {
	return formatReportNumberAmount(parseMoneyNumberInput(value));
}

function formatReportQuantity(value: string) {
	return formatReportNumberAmount(parseMoneyNumberInput(value));
}
