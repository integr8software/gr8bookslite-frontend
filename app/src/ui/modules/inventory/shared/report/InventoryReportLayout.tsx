import type { ReactNode } from "react";

export type InventoryReportInfoRow = {
	label: string;
	value: string;
};

export type InventoryReportTableColumn = {
	key: string;
	label: string;
	align?: "left" | "right" | "center";
	widthClassName?: string;
};

export type InventoryReportTableRow = Record<string, string>;

export type InventoryReportSignature = {
	label: string;
	value?: string;
};

type InventoryReportDocumentProps = {
	afterTitle?: ReactNode;
	footerCodeLabel?: string;
	footerCodeValue?: string;
	infoRows?: InventoryReportInfoRow[];
	signatures?: InventoryReportSignature[];
	tableColumns: InventoryReportTableColumn[];
	tableRows: InventoryReportTableRow[];
	title: string;
};

export function InventoryReportDocument({
	afterTitle,
	footerCodeLabel,
	footerCodeValue,
	infoRows = [],
	signatures = [
		{ label: "Prepared by" },
		{ label: "Approved by" },
	],
	tableColumns,
	tableRows,
	title,
}: InventoryReportDocumentProps) {
	return (
		<div className="mx-auto w-full max-w-[58rem] bg-white p-3 text-[11px] text-black shadow-sm print:p-0 print:shadow-none">
			<div className="flex min-h-[32rem] flex-col border-2 border-black">
				<InventoryReportHeader />
				<div className="grid grid-cols-[1fr_auto] items-end border-b-2 border-black px-3 pb-2">
					<h2 className="text-2xl font-black uppercase leading-none">{title}</h2>
					{afterTitle}
				</div>
				{infoRows.length ? <InventoryReportInfo rows={infoRows} /> : null}
				<InventoryReportTable columns={tableColumns} rows={tableRows} />
				<InventoryReportFooter
					codeLabel={footerCodeLabel}
					codeValue={footerCodeValue}
					signatures={signatures}
				/>
			</div>
			<div className="mt-8 border-t-2 border-black" />
		</div>
	);
}

function InventoryReportHeader() {
	return (
		<div className="grid grid-cols-[8.5rem_1fr_8.5rem] items-start px-4 pt-4">
			<div className="pt-1">
				<img
					src="/img/icons/gr8booksneo-logo-wide.png"
					alt="Company logo"
					className="h-16 w-24 object-contain"
				/>
			</div>
			<div className="text-center">
				<p className="text-sm font-bold">Your Company Name Here</p>
				<p className="mt-1 text-[10px] font-semibold">
					VAT REG TIN : 000-000-000-000
				</p>
				<p className="mt-1 text-[10px] font-semibold uppercase">
					ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District
				</p>
				<p className="mt-3 text-[10px] font-semibold">
					Telephone No: 0967-237-4514
				</p>
			</div>
			<div />
		</div>
	);
}

function InventoryReportInfo({ rows }: { rows: InventoryReportInfoRow[] }) {
	return (
		<div className="border-b-2 border-black text-[11px] font-bold">
			{rows.map((row) => (
				<div
					key={row.label}
					className="grid min-h-6 grid-cols-[9rem_1fr] border-b border-black px-2 py-1 last:border-b-0"
				>
					<span>{row.label}:</span>
					<span className="font-normal">{row.value || "\u00a0"}</span>
				</div>
			))}
		</div>
	);
}

function InventoryReportTable({
	columns,
	rows,
}: {
	columns: InventoryReportTableColumn[];
	rows: InventoryReportTableRow[];
}) {
	const resolvedRows = rows.length ? rows : [Object.fromEntries(columns.map((column) => [column.key, ""]))];

	return (
		<table className="w-full flex-1 border-collapse text-[11px]">
			<thead>
				<tr>
					{columns.map((column) => (
						<th
							key={column.key}
							className={`border-b border-r border-black px-1 py-1 text-center font-bold last:border-r-0 ${column.widthClassName ?? ""}`}
						>
							{column.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{resolvedRows.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{columns.map((column) => (
							<td
								key={column.key}
								className={`border-b border-r border-black px-1 py-1 last:border-r-0 ${getAlignmentClassName(column.align)}`}
							>
								{row[column.key] || "\u00a0"}
							</td>
						))}
					</tr>
				))}
				<tr>
					<td
						colSpan={columns.length}
						className="h-10 border-r-0 border-black px-1 py-1"
					>
						&nbsp;
					</td>
				</tr>
			</tbody>
		</table>
	);
}

function InventoryReportFooter({
	codeLabel,
	codeValue,
	signatures,
}: {
	codeLabel?: string;
	codeValue?: string;
	signatures: InventoryReportSignature[];
}) {
	return (
		<div
			className="grid border-t-2 border-black"
			style={{
				gridTemplateColumns: `${signatures.map(() => "1fr").join(" ")} ${codeLabel ? "9rem" : ""}`,
			}}
		>
			{signatures.map((signature) => (
				<div
					key={signature.label}
					className="min-h-16 border-r border-black p-2 text-[11px] font-bold"
				>
					<p>{signature.label}:</p>
					{signature.value ? (
						<p className="mt-7 text-center font-normal">{signature.value}</p>
					) : null}
				</div>
			))}
			{codeLabel ? (
				<div className="min-h-16 p-2 text-[11px] font-bold">
					<p>{codeLabel}:</p>
					<p className="mt-4 text-right text-2xl font-black">
						{codeValue || "\u00a0"}
					</p>
				</div>
			) : null}
		</div>
	);
}

function getAlignmentClassName(align?: "left" | "right" | "center") {
	if (align === "right") {
		return "text-right";
	}

	if (align === "center") {
		return "text-center";
	}

	return "text-left";
}

export function formatInventoryReportDate(value: string) {
	if (!value) {
		return "-";
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

export function formatInventoryReportNumber(value: string) {
	const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

	return Number.isFinite(numeric)
		? numeric.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		: "0.00";
}

export function formatInventoryReportCode(value: string, fallback = "000000") {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).padStart(6, "0") : fallback;
}
