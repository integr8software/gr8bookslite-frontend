"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	useState,
	type ChangeEvent,
	type ChangeEventHandler,
	type FormEvent,
	type ReactNode,
} from "react";
import {
	ArrowLeft,
	ClipboardList,
	Save,
} from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ReportPreviewAction,
	ReportPreviewDrawer,
} from "@/app/src/ui/shared/reports/Reports";
import { openInventoryCountPdf } from "@/app/src/ui/modules/inventory/inventory-count/InventoryCountPdf";

const InventoryCountHref = "/inventory/inventory-count";

type InventoryCountMode = "add" | "edit" | "view";
export type InventoryCountLine = {
	id: string;
	itemCode: string;
	itemName: string;
	uom: string;
	systemQty: string;
	countQty: string;
	variance: string;
	remarks: string;
};

export type InventoryCountValues = {
	countNo: string;
	countDate: string;
	warehouse: string;
	category: string;
	counter: string;
	status: string;
	remarks: string;
	lines: InventoryCountLine[];
};

export function InventoryCountAction() {
	const pathname = usePathname();
	const router = useRouter();
	const mode = getInventoryCountMode(pathname);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<InventoryCountValues>(
		createInitialInventoryCountValues,
	);
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

	function updateField(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;

		setValues((current) => ({ ...current, [name]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		router.push(InventoryCountHref);
	}

	return (
		<>
			<form className="grid gap-5" onSubmit={handleSubmit}>
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={getInventoryCountTitle(mode, values.countNo)}
					description={
						mode === "view"
							? "Review physical count details, counted quantities, and variances."
							: "Complete warehouse count details and item quantities before saving."
					}
					eyebrow={
						<>
							<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
							Inventory Count
						</>
					}
					actions={
						<div className="flex flex-wrap gap-2">
							<Link
								href={InventoryCountHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
							<ReportPreviewAction
								onPreview={() => setIsReportPreviewOpen(true)}
							/>
							{!isReadonly ? (
								<button
									type="submit"
									className={moduleHeaderActionClassNames.primary}
								>
									<Save className="h-4 w-4" aria-hidden="true" />
									Save
								</button>
							) : null}
						</div>
					}
				/>

				<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 lg:grid-cols-2">
					<TextField
						label="Count No."
						name="countNo"
						readOnly={isReadonly}
						value={values.countNo}
						onChange={updateField}
					/>
					<TextField
						label="Count Date"
						name="countDate"
						readOnly={isReadonly}
						type="date"
						value={values.countDate}
						onChange={updateField}
					/>
					<SelectField
						label="Warehouse"
						name="warehouse"
						disabled={isReadonly}
						value={values.warehouse}
						options={WarehouseOptions}
						onChange={updateField}
					/>
					<SelectField
						label="Item Category"
						name="category"
						disabled={isReadonly}
						value={values.category}
						options={CategoryOptions}
						onChange={updateField}
					/>
					<TextField
						label="Counter"
						name="counter"
						readOnly={isReadonly}
						value={values.counter}
						onChange={updateField}
					/>
					<SelectField
						label="Status"
						name="status"
						disabled={isReadonly}
						value={values.status}
						options={StatusOptions}
						onChange={updateField}
					/>
					<label className="grid gap-2 lg:col-span-2">
						<span className="text-sm font-semibold text-darknavy">Remarks</span>
						<textarea
							name="remarks"
							readOnly={isReadonly}
							value={values.remarks}
							onChange={updateField}
							className={fieldClassName}
							rows={3}
						/>
					</label>
				</section>

				<InventoryCountDisplayTable rows={values.lines} />
			</form>
			<InventoryCountReportPreview
				isOpen={isReportPreviewOpen}
				values={values}
				onClose={() => setIsReportPreviewOpen(false)}
				onPrint={() => openInventoryCountPdf(values)}
			/>
		</>
	);
}

function InventoryCountReportPreview({
	isOpen,
	onClose,
	onPrint,
	values,
}: {
	isOpen: boolean;
	onClose: () => void;
	onPrint: () => void;
	values: InventoryCountValues;
}) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Inventory Count Preview"
			description="Review the printable inventory count report layout."
			onClose={onClose}
			onGeneratePdf={onPrint}
		>
			<div className="mx-auto w-full max-w-[58rem] min-h-[34rem] bg-white px-5 py-8 text-[11px] text-black shadow-sm print:p-0 print:shadow-none">
				<div className="grid grid-cols-[9rem_1fr_9rem] items-start">
					<div className="pt-1">
						<img
							src="/img/icons/gr8booksneo-logo-wide.png"
							alt="Company logo"
							className="h-20 w-28 object-contain"
						/>
					</div>
					<div className="text-center">
						<p className="text-base font-bold">Your Company Name Here</p>
						<p className="mt-1 text-[11px] font-semibold">
							VAT REG TIN : 000-000-000-000
						</p>
						<p className="mt-2 text-[11px] font-semibold">
							ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT
						</p>
						<p className="mt-3 text-[11px] font-semibold">
							Telephone No: 0967-237-4514
						</p>
					</div>
					<div />
				</div>

				<h2 className="mt-8 text-center text-xl font-bold">
					Inventory Count
				</h2>

				<div className="mt-7 overflow-hidden">
					<table className="w-full table-fixed border-collapse border border-black text-[11px]">
						<colgroup>
							<col className="w-[16%]" />
							<col className="w-[32%]" />
							<col className="w-[8%]" />
							<col className="w-[15%]" />
							<col className="w-[15%]" />
							<col className="w-[14%]" />
						</colgroup>
						<thead>
							<tr>
								<ReportHeaderCell>Item Code</ReportHeaderCell>
								<ReportHeaderCell>Description</ReportHeaderCell>
								<ReportHeaderCell>UOM</ReportHeaderCell>
								<ReportHeaderCell>StockQTY</ReportHeaderCell>
								<ReportHeaderCell>PhysicalQTY</ReportHeaderCell>
								<ReportHeaderCell>VarianceQTY</ReportHeaderCell>
							</tr>
						</thead>
						<tbody>
							{values.lines.map((row) => (
								<tr key={row.id}>
									<ReportCell>{row.itemCode}</ReportCell>
									<ReportCell>{row.itemName}</ReportCell>
									<ReportCell>{row.uom}</ReportCell>
									<ReportCell>{formatQuantity(row.systemQty)}</ReportCell>
									<ReportCell>{formatQuantity(row.countQty)}</ReportCell>
									<ReportCell>{formatQuantity(row.variance)}</ReportCell>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</ReportPreviewDrawer>
	);
}

function TextField({
	label,
	name,
	onChange,
	readOnly,
	type = "text",
	value,
}: {
	label: string;
	name: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
	readOnly: boolean;
	type?: "date" | "text";
	value: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				name={name}
				readOnly={readOnly}
				type={type}
				value={value}
				onChange={onChange}
				className={fieldClassName}
			/>
		</label>
	);
}

function SelectField({
	disabled,
	label,
	name,
	onChange,
	options,
	value,
}: {
	disabled: boolean;
	label: string;
	name: string;
	onChange: ChangeEventHandler<HTMLSelectElement>;
	options: readonly string[];
	value: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<select
				name={name}
				disabled={disabled}
				value={value}
				onChange={onChange}
				className={fieldClassName}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}

function ReportHeaderCell({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<th className="border border-black px-1.5 py-1.5 text-center font-bold">
			{children}
		</th>
	);
}

function ReportCell({
	children,
}: {
	children?: ReactNode;
}) {
	return (
		<td className="border border-black px-1.5 py-1 text-center">
			{children || "\u00a0"}
		</td>
	);
}

function formatQuantity(value: string) {
	const quantity = Number.parseFloat(value);

	return Number.isFinite(quantity) ? quantity.toFixed(2) : "0.00";
}

function createInitialInventoryCountValues(): InventoryCountValues {
	return {
		countNo: "INC-2026-0004",
		countDate: "2026-07-17",
		warehouse: "Main Warehouse",
		category: "Finished Goods",
		counter: "",
		status: "Draft",
		remarks: "",
		lines: [
			createInventoryCountLine({
				itemCode: "IM0006",
				itemName: "MESH 325",
				uom: "Bags",
				systemQty: "5.00",
				countQty: "",
			}),
			createInventoryCountLine({
				itemCode: "IM0007",
				itemName: "MESH 20",
				uom: "Bags",
				systemQty: "0.00",
				countQty: "",
			}),
			createInventoryCountLine({
				itemCode: "IM0008",
				itemName: "MESH 30",
				uom: "Bags",
				systemQty: "0.00",
				countQty: "",
			}),
		],
	};
}

function createInventoryCountLine(
	overrides: Partial<InventoryCountLine> = {},
): InventoryCountLine {
	return recalculateLine({
		id: `inc-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		itemName: "",
		uom: "",
		systemQty: "0.00",
		countQty: "",
		variance: "0.00",
		remarks: "",
		...overrides,
	});
}

function recalculateLine(line: InventoryCountLine): InventoryCountLine {
	const systemQty = Number.parseFloat(line.systemQty) || 0;
	const countQty = Number.parseFloat(line.countQty) || 0;

	return {
		...line,
		variance: line.countQty.trim() ? (countQty - systemQty).toFixed(2) : "",
	};
}

function getInventoryCountMode(pathname: string): InventoryCountMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

function getInventoryCountTitle(mode: InventoryCountMode, countNo: string) {
	if (mode === "view") {
		return `View Inventory Count | ${countNo}`;
	}

	if (mode === "edit") {
		return `Edit Inventory Count | ${countNo}`;
	}

	return "Add Inventory Count";
}

const WarehouseOptions = ["Main Warehouse", "Cebu Warehouse", "Davao Warehouse"] as const;
const CategoryOptions = ["Finished Goods", "Raw Materials", "Packaging"] as const;
const StatusOptions = ["Draft", "In Progress", "Approved"] as const;

const fieldClassName =
	"app-theme-field min-h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite read-only:bg-offwhite";

function InventoryCountDisplayTable({ rows }: { rows: InventoryCountLine[] }) {
	const totalVariance = rows.reduce(
		(total, row) => total + (Number.parseFloat(row.variance) || 0),
		0,
	);

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<h2 className="text-sm font-semibold text-darknavy">Count Items</h2>
					<span className="rounded-full border border-darknavy/10 bg-offwhite px-2 py-0.5 text-xs font-medium text-darknavy/55">
						{rows.length} {rows.length === 1 ? "item" : "items"}
					</span>
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[56rem] table-fixed border-collapse text-left text-xs text-darknavy">
					<colgroup>
						<col className="w-[12%]" />
						<col className="w-[32%]" />
						<col className="w-[10%]" />
						<col className="w-[15%]" />
						<col className="w-[16%]" />
						<col className="w-[15%]" />
					</colgroup>
					<thead>
						<tr className="bg-[#f59e0b] text-white">
							<HeaderCell>Item Code</HeaderCell>
							<HeaderCell>Item Name</HeaderCell>
							<HeaderCell>UOM</HeaderCell>
							<HeaderCell className="text-right">Stock On Hand</HeaderCell>
							<HeaderCell className="text-right">Physical Count</HeaderCell>
							<HeaderCell className="text-right">Variance</HeaderCell>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.id} className="border-b border-darknavy/10 last:border-b-0 even:bg-offwhite/55">
								<DisplayCell>{row.itemCode}</DisplayCell>
								<DisplayCell>{row.itemName}</DisplayCell>
								<DisplayCell>{row.uom}</DisplayCell>
								<DisplayCell className="text-right tabular-nums">
									{row.systemQty}
								</DisplayCell>
								<DisplayCell className="text-right tabular-nums">
									{row.countQty}
								</DisplayCell>
								<DisplayCell className="text-right tabular-nums">
									{row.variance}
								</DisplayCell>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-darknavy/10 px-4 py-3">
				<span className="text-xs font-medium text-darknavy/55">
					{rows.length} {rows.length === 1 ? "item" : "items"}
				</span>
				<span className="text-sm font-semibold text-darknavy">
					Total Variance: {totalVariance.toFixed(2)}
				</span>
			</div>
		</section>
	);
}

function HeaderCell({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<th className={`h-10 border-r border-white/20 px-3 py-2 text-xs font-semibold last:border-r-0 ${className}`}>
			{children}
		</th>
	);
}

function DisplayCell({
	children,
	className = "",
}: {
	children?: ReactNode;
	className?: string;
}) {
	return (
		<td className={`h-10 border-r border-darknavy/10 px-3 py-2 last:border-r-0 ${className}`}>
			{children}
		</td>
	);
}
