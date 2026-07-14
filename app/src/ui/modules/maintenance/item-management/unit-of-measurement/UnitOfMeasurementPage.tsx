"use client";

import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	ArrowLeft,
	CheckCircle2,
	CirclePause,
	Plus,
	Ruler,
	Save,
	Search,
	Trash2,
} from "lucide-react";
import {
	Fragment,
	useMemo,
	useState,
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { SystemUomRows } from "@/app/src/data/shared/uom/UomData";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

const UnitOfMeasurementHref =
	"/maintenance/item-management/unit-of-measurement";

type UnitStatus = "Active" | "Inactive";
type QuantityMode = "Integer" | "Float";
type ActionMode = "add" | "edit" | "view";

type UnitConversionRule = {
	id: string;
	baseQuantity: number;
	baseUnit: string;
	equivalentQuantity: number;
	equivalentUnit: string;
};

type UnitOfMeasurementRecord = {
	id: string;
	name: string;
	symbol: string;
	quantityMode: QuantityMode;
	conversions: UnitConversionRule[];
	status: UnitStatus;
};

type UnitFormValues = Omit<UnitOfMeasurementRecord, "id">;

const SampleUnitRecords: UnitOfMeasurementRecord[] = [
	{
		id: "uom-piece",
		name: "Piece",
		symbol: "PCS",
		quantityMode: "Integer",
		status: "Active",
		conversions: [],
	},
	{
		id: "uom-box",
		name: "Box",
		symbol: "BOX",
		quantityMode: "Integer",
		status: "Active",
		conversions: [
			createConversionRule({
				baseQuantity: 1,
				baseUnit: "BOX",
				equivalentQuantity: 12,
				equivalentUnit: "PCS",
			}),
		],
	},
	{
		id: "uom-pack",
		name: "Pack",
		symbol: "PACK",
		quantityMode: "Integer",
		status: "Active",
		conversions: [
			createConversionRule({
				baseQuantity: 1,
				baseUnit: "PACK",
				equivalentQuantity: 6,
				equivalentUnit: "PCS",
			}),
		],
	},
	{
		id: "uom-kilogram",
		name: "Kilogram",
		symbol: "KG",
		quantityMode: "Float",
		status: "Active",
		conversions: [
			createConversionRule({
				baseQuantity: 1,
				baseUnit: "KG",
				equivalentQuantity: 1000,
				equivalentUnit: "G",
			}),
		],
	},
	{
		id: "uom-liter",
		name: "Liter",
		symbol: "L",
		quantityMode: "Float",
		status: "Active",
		conversions: [
			createConversionRule({
				baseQuantity: 1,
				baseUnit: "L",
				equivalentQuantity: 1000,
				equivalentUnit: "ML",
			}),
		],
	},
];

export function UnitOfMeasurementListPage() {
	const [rows, setRows] = useState<UnitOfMeasurementRecord[]>(SampleUnitRecords);
	const [pendingStatusRow, setPendingStatusRow] =
		useState<UnitOfMeasurementRecord | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Active");
	const [quantityTypeFilter, setQuantityTypeFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredRows = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return rows.filter(
			(row) =>
				(statusFilter === "All" || row.status === statusFilter) &&
				(quantityTypeFilter === "All" ||
					row.quantityMode === quantityTypeFilter) &&
				(!normalizedQuery ||
					[
						row.name,
						row.symbol,
						row.quantityMode,
						row.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [quantityTypeFilter, query, rows, statusFilter]);
	const columns = useMemo<ColumnDef<UnitOfMeasurementRecord>[]>(
		() => [
			createColumn("name", "Unit of Measurement", "w-[18rem]"),
			createColumn("symbol", "Symbol", "w-[9rem]"),
			createColumn("quantityMode", "Quantity Type", "w-[12rem]"),
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[10rem] text-center" },
			},
		],
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRows,
		columns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const activeCount = rows.filter((row) => row.status === "Active").length;
	const decimalCount = rows.filter((row) => row.quantityMode === "Float").length;
	const nextPendingStatus =
		pendingStatusRow?.status === "Active" ? "Inactive" : "Active";

	function confirmStatusChange() {
		if (!pendingStatusRow) {
			return;
		}

		setRows((currentRows) =>
			currentRows.map((row) =>
				row.id === pendingStatusRow.id
					? { ...row, status: nextPendingStatus }
					: row,
			),
		);
		setPendingStatusRow(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Unit of Measurement"
				description="Maintain units and central conversion rules used by item records, purchasing, sales, and inventory quantities."
				eyebrow={
					<>
						<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link
						href={`${UnitOfMeasurementHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Unit
					</Link>
				}
			/>
			<ModuleStatisticCards
				items={[
					{
						helper: "Configured units",
						icon: Ruler,
						label: "Total Units",
						value: rows.length,
					},
					{
						helper: "Available for transactions",
						icon: CheckCircle2,
						label: "Active",
						tone: "emerald",
						value: activeCount,
					},
					{
						helper: "Allows decimal quantities",
						icon: Ruler,
						label: "Decimal",
						tone: "violet",
						value: decimalCount,
					},
					{
						helper: "Kept for history",
						icon: CirclePause,
						label: "Inactive",
						tone: "amber",
						value: rows.length - activeCount,
					},
				]}
			/>
			<ModuleTable
				emptyDescription="Add a unit and define how it converts to other units."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No unit of measurement records found"
				minWidthClassName="min-w-[64rem]"
				paginationStorageKey="maintenance.item-management.unit-of-measurement"
				table={table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search unit of measurement"
							placeholder="Search by unit, symbol, or quantity type"
							value={query}
							onChange={(value) => {
								setQuery(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableFilterSelect
							label="Quantity Type"
							value={quantityTypeFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Whole Number", value: "Integer" },
								{ label: "Decimal", value: "Float" },
							]}
							onChange={(value) => {
								setQuantityTypeFilter(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={(value) => {
								setStatusFilter(value);
								table.setPageIndex(0);
							}}
						/>
						<ModuleTableResetButton
							onClick={() => {
								setQuery("");
								setQuantityTypeFilter("All");
								setStatusFilter("Active");
								table.setPageIndex(0);
							}}
						/>
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="module-table-row border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 font-semibold">{original.name}</td>
						<td className="px-4 py-4 font-semibold">{original.symbol}</td>
						<td className="px-4 py-4 text-darknavy/70">
							{formatQuantityMode(original.quantityMode)}
						</td>
						<td className="px-4 py-4">
							<StatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<ModuleTableActions className="justify-center">
								<ModuleTableActionLink
									variant="view"
									href={`${UnitOfMeasurementHref}/view/${original.id}`}
									label={`View ${original.name}`}
								/>
								<ModuleTableActionLink
									variant="edit"
									href={`${UnitOfMeasurementHref}/edit/${original.id}`}
									label={`Edit ${original.name}`}
								/>
								<ModuleTableActionButton
									variant={original.status === "Active" ? "inactive" : "active"}
									label={
										original.status === "Active"
											? `Set ${original.name} inactive`
											: `Set ${original.name} active`
									}
									onClick={() => setPendingStatusRow(original)}
								/>
							</ModuleTableActions>
						</td>
					</tr>
				)}
			/>
			<AppDialog
				isOpen={Boolean(pendingStatusRow)}
				title={`Set unit ${nextPendingStatus.toLowerCase()}?`}
				description={
					pendingStatusRow
						? `${pendingStatusRow.name} will be marked as ${nextPendingStatus}.`
						: ""
				}
				confirmLabel={`Set ${nextPendingStatus}`}
				tone={nextPendingStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => setPendingStatusRow(null)}
				onConfirm={confirmStatusChange}
			/>
		</section>
	);
}

export function UnitOfMeasurementActionPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getMode(pathname);
	const isReadonly = mode === "view";
	const existingRecord = SampleUnitRecords.find(
		(record) => record.id === params.recordId,
	);
	const needsRecord = mode !== "add";
	const [values, setValues] = useState<UnitFormValues>(() =>
		existingRecord
			? createFormValues(existingRecord)
			: {
					name: "",
					symbol: "",
					quantityMode: "Integer",
					conversions: [createEmptyConversionRule()],
					status: "Active",
				},
	);

	if (needsRecord && !existingRecord) {
		return (
			<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
				<h1 className="text-xl font-semibold text-darknavy">
					Unit of measurement not found
				</h1>
				<p className="mt-2 text-sm text-darknavy/55">
					The selected unit may have been removed or is no longer available.
				</p>
				<Link
					href={UnitOfMeasurementHref}
					className={`${moduleHeaderActionClassNames.secondary} mt-5`}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			</section>
		);
	}

	function updateField<TKey extends keyof UnitFormValues>(
		field: TKey,
		value: UnitFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => {
			if (field !== "symbol" || typeof value !== "string") {
				return { ...current, [field]: value };
			}

			const nextSymbol = value.toUpperCase();

			return {
				...current,
				symbol: nextSymbol,
				conversions: current.conversions.map((conversion) =>
					!conversion.baseUnit || conversion.baseUnit === current.symbol
						? { ...conversion, baseUnit: nextSymbol }
						: conversion,
				),
			};
		});
	}

	function addConversion() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			conversions: [...current.conversions, createEmptyConversionRule(current.symbol)],
		}));
	}

	function updateConversion(
		conversionId: string,
		update: Partial<UnitConversionRule>,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			conversions: current.conversions.map((conversion) =>
				conversion.id === conversionId
					? { ...conversion, ...update }
					: conversion,
			),
		}));
	}

	function removeConversion(conversionId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			conversions:
				current.conversions.length > 1
					? current.conversions.filter(
							(conversion) => conversion.id !== conversionId,
						)
					: current.conversions,
		}));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly) {
			return;
		}

		router.push(UnitOfMeasurementHref);
	}

	const title =
		mode === "add"
			? "Add Unit of Measurement"
			: mode === "edit"
				? "Edit Unit of Measurement"
				: "View Unit of Measurement";

	return (
		<form onSubmit={handleSubmit} className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description="Configure the unit and its central conversion rules for quantity entry across item workflows."
				eyebrow={
					<>
						<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<>
						<Link
							href={UnitOfMeasurementHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button type="submit" className={moduleHeaderActionClassNames.primary}>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save Unit
							</button>
						) : null}
					</>
				}
			/>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Unit Details
				</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<Field label="Unit of Measurement" required>
						<input
							value={values.name}
							readOnly={isReadonly}
							onChange={(event) => updateField("name", event.target.value)}
							className={fieldClassName}
							placeholder="Box"
						/>
					</Field>
					<Field label="Symbol" required>
						<input
							value={values.symbol}
							readOnly={isReadonly}
							onChange={(event) =>
								updateField("symbol", event.target.value.toUpperCase())
							}
							className={fieldClassName}
							placeholder="BOX"
						/>
					</Field>
					<Field label="Quantity Type" required>
						<select
							value={values.quantityMode}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("quantityMode", event.target.value as QuantityMode)
							}
							className={fieldClassName}
						>
							<option value="Integer">Whole number quantities</option>
							<option value="Float">Decimal quantities</option>
						</select>
					</Field>
					<Field label="Status" required>
						<select
							value={values.status}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("status", event.target.value as UnitStatus)
							}
							className={fieldClassName}
						>
							<option>Active</option>
							<option>Inactive</option>
						</select>
					</Field>
				</div>
			</section>
			<ConversionRulesTable
				conversions={values.conversions}
				isReadonly={isReadonly}
				primarySymbol={values.symbol}
				onAddConversion={addConversion}
				onRemoveConversion={removeConversion}
				onUpdateConversion={updateConversion}
			/>
		</form>
	);
}

function ConversionRulesTable({
	conversions,
	isReadonly,
	primarySymbol,
	onAddConversion,
	onRemoveConversion,
	onUpdateConversion,
}: {
	conversions: UnitConversionRule[];
	isReadonly: boolean;
	primarySymbol: string;
	onAddConversion: () => void;
	onRemoveConversion: (conversionId: string) => void;
	onUpdateConversion: (
		conversionId: string,
		update: Partial<UnitConversionRule>,
	) => void;
}) {
	const uomOptions = getUomOptions(primarySymbol);
	const columnCount = isReadonly ? 4 : 5;

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Conversion Rules
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Configure central quantity rules such as 1 BOX = 12 PCS.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddConversion}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Conversion
					</button>
				) : null}
			</div>
			<div className="mt-4 overflow-auto">
				<table className="w-full min-w-[48rem] table-fixed text-left text-sm">
					<colgroup>
						<col className="w-[8rem]" />
						<col className="w-[13rem]" />
						<col className="w-[8rem]" />
						<col className="w-[13rem]" />
						{!isReadonly ? <col className="w-[7rem]" /> : null}
					</colgroup>
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-3 py-3">Qty</th>
							<th className="px-3 py-3">UOM</th>
							<th className="px-3 py-3">Equal Qty</th>
							<th className="px-3 py-3">Equal UOM</th>
							{!isReadonly ? (
								<th className="px-3 py-3 text-center">Actions</th>
							) : null}
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{conversions.length === 0 ? (
							<tr>
								<td
									colSpan={columnCount}
									className="px-3 py-6 text-center text-sm text-darknavy/55"
								>
									No conversion rules added.
								</td>
							</tr>
						) : null}
						{conversions.map((conversion) => (
							<Fragment key={conversion.id}>
								<tr>
									<td className="px-3 py-3">
										<DecimalNumberInput
											key={`${conversion.id}-base-${conversion.baseQuantity}`}
											value={conversion.baseQuantity}
											readOnly={isReadonly}
											onValueChange={(value) =>
												onUpdateConversion(conversion.id, {
													baseQuantity: value,
												})
											}
										/>
									</td>
									<td className="px-3 py-3">
										<UomSelect
											isReadonly={isReadonly}
											options={uomOptions}
											value={conversion.baseUnit}
											onChange={(value) =>
												onUpdateConversion(conversion.id, { baseUnit: value })
											}
										/>
									</td>
									<td className="px-3 py-3">
										<DecimalNumberInput
											key={`${conversion.id}-equivalent-${conversion.equivalentQuantity}`}
											value={conversion.equivalentQuantity}
											readOnly={isReadonly}
											onValueChange={(value) =>
												onUpdateConversion(conversion.id, {
													equivalentQuantity: value,
												})
											}
										/>
									</td>
									<td className="px-3 py-3">
										<UomSelect
											isReadonly={isReadonly}
											options={uomOptions}
											value={conversion.equivalentUnit}
											onChange={(value) =>
												onUpdateConversion(conversion.id, {
													equivalentUnit: value,
												})
											}
										/>
									</td>
									{!isReadonly ? (
										<td className="px-3 py-3 text-center">
										<button
											type="button"
											onClick={() => onRemoveConversion(conversion.id)}
											className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-coralpink/25 bg-white text-coralpink transition hover:bg-coralpink/10"
											aria-label="Remove conversion"
										>
											<Trash2 className="h-4 w-4" aria-hidden="true" />
										</button>
										</td>
									) : null}
								</tr>
								<tr className="bg-darknavy/[0.015]">
									<td
										colSpan={columnCount}
										className="px-3 pb-3 pt-0 text-xs font-medium text-darknavy/55"
									>
										<span className="inline-flex rounded-md bg-skyblue/8 px-3 py-2">
											Reverse conversion: {formatReverseConversionRule(conversion)}
										</span>
									</td>
								</tr>
							</Fragment>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function UomSelect({
	isReadonly,
	options,
	value,
	onChange,
}: {
	isReadonly: boolean;
	options: AppAdvancedDropdownOption[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<AppAdvancedDropdown
			menuPortal
			isClearable={false}
			options={options}
			placeholder="Select UOM"
			readOnly={isReadonly}
			searchPlaceholder="Search UOM"
			showSelectedDetails
			value={value}
			onChange={(nextValue) => onChange(String(nextValue))}
			onSelectOption={(option) => onChange(option.value)}
		/>
	);
}

function DecimalNumberInput({
	readOnly,
	value,
	onValueChange,
}: {
	readOnly: boolean;
	value: number;
	onValueChange: (value: number) => void;
}) {
	const [draftValue, setDraftValue] = useState(String(value));

	function handleChange(nextValue: string) {
		if (/[eE+-]/.test(nextValue)) {
			return;
		}

		setDraftValue(nextValue);

		if (!nextValue.trim()) {
			return;
		}

		const parsedValue = Number(nextValue);

		if (Number.isFinite(parsedValue) && parsedValue >= 0) {
			onValueChange(parsedValue);
		}
	}

	function handleBlur() {
		if (!draftValue.trim()) {
			onValueChange(0);
			setDraftValue("0");
		}
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault();
		}
	}

	return (
		<input
			type="number"
			min={0}
			step="any"
			inputMode="decimal"
			value={draftValue}
			readOnly={readOnly}
			onBlur={handleBlur}
			onChange={(event) => handleChange(event.target.value)}
			onKeyDown={handleKeyDown}
			className={fieldClassName}
		/>
	);
}

function Field({
	children,
	label,
	required,
}: {
	children: ReactNode;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
		</label>
	);
}

function StatusBadge({ status }: { status: UnitStatus }) {
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
				status === "Active"
					? "bg-emerald-50 text-emerald-700"
					: "bg-amber-50 text-amber-700"
			}`}
		>
			{status}
		</span>
	);
}

function createColumn(
	key: keyof UnitOfMeasurementRecord,
	header: string,
	className: string,
): ColumnDef<UnitOfMeasurementRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function createFormValues(record: UnitOfMeasurementRecord): UnitFormValues {
	return {
		name: record.name,
		symbol: record.symbol,
		quantityMode: record.quantityMode,
		conversions: record.conversions,
		status: record.status,
	};
}

function createEmptyConversionRule(primarySymbol = ""): UnitConversionRule {
	return createConversionRule({
		baseQuantity: 1,
		baseUnit: primarySymbol,
		equivalentQuantity: 1,
		equivalentUnit: "",
	});
}

function createConversionRule(
	rule: Omit<UnitConversionRule, "id">,
): UnitConversionRule {
	return {
		id: `uom-conversion-${Date.now()}-${Math.random().toString(16).slice(2)}`,
		...rule,
	};
}

function getUomOptions(primarySymbol: string): AppAdvancedDropdownOption[] {
	const normalizedPrimarySymbol = primarySymbol.trim().toUpperCase();
	const optionRows = normalizedPrimarySymbol
		? [
				...SystemUomRows.filter((uom) => uom.code === normalizedPrimarySymbol),
				...SystemUomRows.filter((uom) => uom.code !== normalizedPrimarySymbol),
			]
		: SystemUomRows;
	const options = optionRows.map<AppAdvancedDropdownOption>((uom) => ({
		description:
			uom.quantityKind === "Integer" ? "Whole number" : "Decimal quantity",
		label: uom.description,
		name: uom.code,
		value: uom.code,
	}));

	if (
		normalizedPrimarySymbol &&
		!options.some((option) => option.value === normalizedPrimarySymbol)
	) {
		return [
			{
				description: "Current unit",
				label: "Current UOM",
				name: normalizedPrimarySymbol,
				value: normalizedPrimarySymbol,
			},
			...options,
		];
	}

	return options;
}

function formatQuantityMode(mode: QuantityMode) {
	return mode === "Integer" ? "Whole number" : "Decimal";
}

function formatReverseConversionRule(conversion: UnitConversionRule) {
	return `${formatNumber(conversion.equivalentQuantity)} ${
		conversion.equivalentUnit || "Unit"
	} = ${formatNumber(conversion.baseQuantity)} ${
		conversion.baseUnit || "Unit"
	}`;
}

function formatNumber(value: number) {
	return Number.isInteger(value) ? String(value) : value.toLocaleString("en-US");
}

function getMode(pathname: string): ActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";
