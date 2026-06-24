"use client";

import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	BadgeDollarSign,
	CheckCircle2,
	CirclePause,
	ListChecks,
	Plus,
	Ruler,
	Save,
	Search,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppLimitedTextareaMaxLength } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";
import type { ItemAttributeRecord } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemManagementSupportPageKind =
	| "item-attributes"
	| "price-lists"
	| "unit-of-measurement";

type SupportRecord = {
	code: string;
	description: string;
	detail: string;
	id: string;
	name: string;
	status: string;
	valueEntries?: string[];
};

type SupportModalMode = "add" | "edit" | "view";

type SupportModalState = {
	mode: SupportModalMode;
	record: SupportRecord;
} | null;

const PageConfig = {
	"item-attributes": {
		description: "Maintain reusable item attributes and values that can be assigned to item records for variants, stock classification, and item filtering.",
		actionLabel: "Add Attribute",
		icon: ListChecks,
		records: [
			createRecord("ATT-001", "Color", "Variant", "Red, Blue, Black, White", "Active"),
			createRecord("ATT-002", "Size", "Variant", "Small, Medium, Large, XL", "Active"),
			createRecord("ATT-003", "Storage", "Variant", "128GB, 256GB, 512GB, 1TB", "Active"),
			createRecord("ATT-004", "Material", "Item attribute", "Cotton, Steel, Plastic, Wood", "Active"),
			createRecord("ATT-005", "Model Year", "Item detail link", "2024, 2025, 2026", "Active"),
		],
		tableHeaders: ["Attribute Name", "Values", "Status"],
		title: "Item Attributes",
	},
	"price-lists": {
		description: "Maintain multi-pricing structures used on item records for retail, wholesale, dealer, VIP, distributor, and other customer groups.",
		actionLabel: "Add Price List",
		icon: BadgeDollarSign,
		records: [
			createRecord("PL-001", "Retail", "Default customer price", "PHP", "Active"),
			createRecord("PL-002", "Wholesale", "Volume buyer price", "PHP", "Active"),
			createRecord("PL-003", "Dealer", "Dealer and reseller price", "PHP", "Active"),
			createRecord("PL-004", "VIP", "Preferred account price", "PHP", "Inactive"),
			createRecord("PL-005", "Distributor", "Distributor channel price", "PHP", "Active"),
		],
		tableHeaders: ["Price List Code", "Price List", "Customer Group", "Currency / Mode", "Status"],
		title: "Price Lists",
	},
	"unit-of-measurement": {
		description: "Maintain unit codes used by item records and item-specific conversions for purchasing, sales, stock, and barcode handling.",
		actionLabel: "Add Unit",
		icon: Ruler,
		records: [
			createRecord("UOM-001", "Piece", "PCS", "Base unit", "Active"),
			createRecord("UOM-002", "Box", "BOX", "Base PCS | Qty 12 | Integer", "Active"),
			createRecord("UOM-003", "Pack", "PACK", "Base PCS | Qty 6 | Integer", "Active"),
			createRecord("UOM-004", "Kilogram", "KG", "Base G | Qty 1000 | Float", "Active"),
			createRecord("UOM-005", "Gram", "G", "Base weight sub-unit", "Active"),
			createRecord("UOM-006", "Meter", "M", "Length unit", "Active"),
			createRecord("UOM-007", "Liter", "L", "Liquid volume unit", "Active"),
		],
		tableHeaders: ["UOM Code", "Unit", "Symbol", "Base / Conversion", "Status"],
		title: "Unit of Measurement",
	},
} satisfies Record<
	ItemManagementSupportPageKind,
	{
		description: string;
		actionLabel: string;
		icon: typeof Ruler;
		records: SupportRecord[];
		tableHeaders: string[];
		title: string;
	}
>;

export function ItemManagementSupportPage({
	kind,
}: {
	kind: ItemManagementSupportPageKind;
}) {
	const config = PageConfig[kind];
	const Icon = config.icon;
	const { itemAttributes } = useItemManagementStore();
	const initialRecords = useMemo(
		() =>
			kind === "item-attributes"
				? itemAttributes.map(createAttributeSupportRecord)
				: config.records,
		[config.records, itemAttributes, kind],
	);
	const [records, setRecords] = useState(() => initialRecords);
	const [modal, setModal] = useState<SupportModalState>(null);
	const [pendingStatusRecord, setPendingStatusRecord] =
		useState<SupportRecord | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter(
			(record) =>
				(statusFilter === "All" || record.status === statusFilter) &&
				(!normalizedQuery ||
					[
						record.code,
						record.name,
						record.description,
						record.detail,
						...(record.valueEntries ?? []),
						record.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [records, query, statusFilter]);
	const columns = useMemo<ColumnDef<SupportRecord>[]>(
		() => {
			if (kind === "item-attributes") {
				return [
					createColumn("name", "Attribute Name"),
					{
						id: "valueEntries",
						header: "Values",
						enableSorting: false,
						meta: { className: "w-[28rem]" },
					},
					createColumn("status", "Status"),
					{
						id: "actions",
						header: "Actions",
						enableSorting: false,
						meta: { className: "w-[9rem] text-center" },
					},
				];
			}

			return [
				createColumn("code", config.tableHeaders[0]),
				createColumn("name", config.tableHeaders[1]),
				createColumn("description", config.tableHeaders[2]),
				createColumn("detail", config.tableHeaders[3]),
				createColumn("status", config.tableHeaders[4]),
				{
					id: "actions",
					header: "Actions",
					enableSorting: false,
					meta: { className: "w-[9rem] text-center" },
				},
			];
		},
		[config.tableHeaders, kind],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const activeCount = records.filter(
		(record) => record.status === "Active",
	).length;
	const nextPendingStatus =
		pendingStatusRecord?.status === "Active" ? "Inactive" : "Active";

	function openAddModal() {
		setModal({
			mode: "add",
			record: createEmptyRecord(kind, records.length + 1),
		});
	}

	function openRecordModal(mode: SupportModalMode, record: SupportRecord) {
		setModal({ mode, record: { ...record } });
	}

	function updateModalRecord<TKey extends keyof SupportRecord>(
		field: TKey,
		value: SupportRecord[TKey],
	) {
		setModal((currentModal) =>
			currentModal
				? {
						...currentModal,
						record: { ...currentModal.record, [field]: value },
					}
				: currentModal,
		);
	}

	function saveModalRecord() {
		if (!modal || modal.mode === "view") {
			return;
		}

		const nextRecord =
			kind === "item-attributes"
				? normalizeAttributeSupportRecord(modal.record)
				: modal.record;

		setRecords((currentRecords) => {
			if (modal.mode === "add") {
				return [...currentRecords, nextRecord];
			}

			return currentRecords.map((record) =>
				record.id === nextRecord.id ? nextRecord : record,
			);
		});
		setModal(null);
	}

	function confirmStatusChange() {
		if (!pendingStatusRecord) {
			return;
		}

		setRecords((currentRecords) =>
			currentRecords.map((record) =>
				record.id === pendingStatusRecord.id
					? {
							...record,
							status: nextPendingStatus,
						}
					: record,
			),
		);
		setPendingStatusRecord(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={config.title}
				description={config.description}
				actions={
					<button
						type="button"
						className={moduleHeaderActionClassNames.primary}
						onClick={openAddModal}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{config.actionLabel}
					</button>
				}
				eyebrow={
					<>
						<Icon className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
			/>
			<ModuleStatisticCards
				items={[
					{
						helper: "Setup records",
						icon: Icon,
						label: "Total Records",
						value: records.length,
					},
					{
						helper: "Available for selection",
						icon: CheckCircle2,
						label: "Active",
						tone: "emerald",
						value: activeCount,
					},
					{
						helper: "Kept for history",
						icon: CirclePause,
						label: "Inactive",
						tone: "amber",
						value: records.length - activeCount,
					},
				]}
			/>
			<ModuleTable
				emptyDescription="Try adjusting your filters or add a new setup record."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle={`No ${config.title.toLowerCase()} found`}
				minWidthClassName={
					kind === "item-attributes" ? "min-w-[58rem]" : "min-w-[64rem]"
				}
				paginationStorageKey={`maintenance.item-management.${kind}`}
				table={table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label={`Search ${config.title}`}
							placeholder={`Search ${config.title.toLowerCase()}`}
							value={query}
							onChange={(value) => {
								setQuery(value);
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
								setStatusFilter("All");
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
						{kind === "item-attributes" ? (
							<>
								<td className="px-4 py-4 font-semibold">{original.name}</td>
								<td className="px-4 py-4">
									<ValueEntrySummary values={original.valueEntries ?? []} />
								</td>
							</>
						) : (
							<>
								<td className="px-4 py-4 font-semibold">{original.code}</td>
								<td className="px-4 py-4">{original.name}</td>
								<td className="px-4 py-4 text-darknavy/70">
									{original.description}
								</td>
								<td className="px-4 py-4 text-darknavy/70">
									{original.detail}
								</td>
							</>
						)}
						<td className="px-4 py-4">
							<StatusBadge status={original.status} />
						</td>
						<td className="px-4 py-4 text-center">
							<ModuleTableActions className="justify-center">
								<ModuleTableActionButton
									variant="view"
									label={`View ${original.name}`}
									onClick={() => openRecordModal("view", original)}
								/>
								<ModuleTableActionButton
									variant="edit"
									label={`Edit ${original.name}`}
									onClick={() => openRecordModal("edit", original)}
								/>
								<ModuleTableActionButton
									variant={original.status === "Active" ? "inactive" : "active"}
									label={
										original.status === "Active"
											? `Set ${original.name} inactive`
											: `Reactivate ${original.name}`
									}
									onClick={() => setPendingStatusRecord(original)}
								/>
							</ModuleTableActions>
						</td>
					</tr>
				)}
			/>
			<SupportRecordModal
				config={config}
				kind={kind}
				modal={modal}
				onCancel={() => setModal(null)}
				onChange={updateModalRecord}
				onSave={saveModalRecord}
			/>
			<AppDialog
				isOpen={Boolean(pendingStatusRecord)}
				title={`Set record ${nextPendingStatus.toLowerCase()}?`}
				description={
					pendingStatusRecord
						? `${pendingStatusRecord.name} will be marked as ${nextPendingStatus}.`
						: ""
				}
				confirmLabel={`Set ${nextPendingStatus}`}
				tone={nextPendingStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => setPendingStatusRecord(null)}
				onConfirm={confirmStatusChange}
			/>
		</section>
	);
}

export function ItemAttributesListPage() {
	return <ItemManagementSupportPage kind="item-attributes" />;
}

export function PriceListsListPage() {
	return <ItemManagementSupportPage kind="price-lists" />;
}

export function UnitOfMeasurementSupportListPage() {
	return <ItemManagementSupportPage kind="unit-of-measurement" />;
}

function SupportRecordModal({
	config,
	kind,
	modal,
	onCancel,
	onChange,
	onSave,
}: {
	config: (typeof PageConfig)[ItemManagementSupportPageKind];
	kind: ItemManagementSupportPageKind;
	modal: SupportModalState;
	onCancel: () => void;
	onChange: <TKey extends keyof SupportRecord>(
		field: TKey,
		value: SupportRecord[TKey],
	) => void;
	onSave: () => void;
}) {
	if (!modal) {
		return null;
	}

	const isReadonly = modal.mode === "view";
	const title =
		modal.mode === "add"
			? config.actionLabel
			: `${isReadonly ? "View" : "Edit"} ${modal.record.name}`;

	return (
		<ModuleDrawer
			isOpen={Boolean(modal)}
			title={title}
			description={
				isReadonly
					? "Review this setup record before making changes."
					: "Update the setup fields used by item records and transactions."
			}
			position="right"
			maxWidthClassName="max-w-2xl"
			onClose={onCancel}
			footer={
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
					>
						{isReadonly ? "Close" : "Cancel"}
					</button>
					{!isReadonly ? (
						<button
							type="button"
							onClick={onSave}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					) : null}
				</div>
			}
		>
			<div className="grid gap-4 px-6 py-5 md:grid-cols-2">
				{kind === "item-attributes" ? (
					<>
						<div className="md:col-span-2">
							<SupportField
								label="Attribute Name"
								value={modal.record.name}
								readOnly={isReadonly}
								onChange={(value) => onChange("name", value)}
							/>
						</div>
						<div className="md:col-span-2">
							<ValueEntriesEditor
								readOnly={isReadonly}
								values={modal.record.valueEntries ?? []}
								onChange={(values) => onChange("valueEntries", values)}
							/>
						</div>
					</>
				) : (
					<>
						<SupportField
							label={config.tableHeaders[0]}
							value={modal.record.code}
							readOnly={isReadonly}
							onChange={(value) => onChange("code", value)}
						/>
						<SupportField
							label={config.tableHeaders[1]}
							value={modal.record.name}
							readOnly={isReadonly}
							onChange={(value) => onChange("name", value)}
						/>
						<SupportField
							label={config.tableHeaders[2]}
							value={modal.record.description}
							readOnly={isReadonly}
							maxLength={AppLimitedTextareaMaxLength}
							onChange={(value) => onChange("description", value)}
						/>
						<SupportField
							label={config.tableHeaders[3]}
							value={modal.record.detail}
							readOnly={isReadonly}
							onChange={(value) => onChange("detail", value)}
						/>
					</>
				)}
				<label>
					<span className="mb-2 block text-sm font-semibold text-darknavy">
						Status
					</span>
					<select
						value={modal.record.status}
						disabled={isReadonly}
						onChange={(event) => onChange("status", event.target.value)}
						className={fieldClassName}
					>
						<option>Active</option>
						<option>Inactive</option>
					</select>
				</label>
			</div>
		</ModuleDrawer>
	);
}

function SupportField({
	label,
	maxLength,
	readOnly,
	value,
	onChange,
}: {
	label: string;
	maxLength?: number;
	readOnly: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
			</span>
			<input
				value={value}
				readOnly={readOnly}
				maxLength={maxLength}
				onChange={(event) => onChange(event.target.value)}
				className={fieldClassName}
			/>
			{maxLength ? (
				<span className="mt-1 block text-xs text-darknavy/45">
					Characters remaining: {Math.max(0, maxLength - value.length)}
				</span>
			) : null}
		</label>
	);
}

function ValueEntrySummary({ values }: { values: string[] }) {
	const filledValues = values.filter((value) => value.trim());

	if (filledValues.length === 0) {
		return <span className="text-sm text-darknavy/45">No values added</span>;
	}

	const visibleValues = filledValues.slice(0, 4);
	const hiddenCount = filledValues.length - visibleValues.length;

	return (
		<div className="flex flex-wrap gap-1.5">
			{visibleValues.map((value) => (
				<span
					key={value}
					className="inline-flex max-w-[12rem] rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy"
				>
					<span className="truncate">{value}</span>
				</span>
			))}
			{hiddenCount > 0 ? (
				<span className="inline-flex rounded-md bg-darknavy/5 px-2.5 py-1 text-xs font-semibold text-darknavy/60">
					+{hiddenCount} more
				</span>
			) : null}
		</div>
	);
}

function ValueEntriesEditor({
	readOnly,
	values,
	onChange,
}: {
	readOnly: boolean;
	values: string[];
	onChange: (values: string[]) => void;
}) {
	const visibleValues = values.length > 0 ? values : [""];

	function updateValue(index: number, value: string) {
		onChange(
			visibleValues.map((currentValue, currentIndex) =>
				currentIndex === index ? value : currentValue,
			),
		);
	}

	function addValue() {
		onChange([...visibleValues, ""]);
	}

	function removeValue(index: number) {
		if (visibleValues.length === 1) {
			onChange([""]);
			return;
		}

		onChange(visibleValues.filter((_, currentIndex) => currentIndex !== index));
	}

	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-3">
				<span className="block text-sm font-semibold text-darknavy">Values</span>
				{!readOnly ? (
					<button
						type="button"
						onClick={addValue}
						className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy transition hover:bg-darknavy/5"
					>
						<Plus className="h-3.5 w-3.5" aria-hidden="true" />
						Add Value
					</button>
				) : null}
			</div>
			<div className="grid gap-2">
				{visibleValues.map((value, index) => (
					<div key={index} className="flex items-center gap-2">
						<input
							value={value}
							readOnly={readOnly}
							onChange={(event) => updateValue(index, event.target.value)}
							className={fieldClassName}
							placeholder="Enter value"
						/>
						{!readOnly ? (
							<button
								type="button"
								onClick={() => removeValue(index)}
								className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-coralpink/25 bg-white text-coralpink transition hover:bg-coralpink/10"
								aria-label="Remove value"
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
							</button>
						) : null}
					</div>
				))}
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
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
	key: keyof SupportRecord,
	header: string,
): ColumnDef<SupportRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className: key === "description" ? "w-[18rem]" : "w-[12rem]" },
	};
}

function createRecord(
	code: string,
	name: string,
	description: string,
	detail: string,
	status: string,
): SupportRecord {
	return { code, description, detail, id: code.toLowerCase(), name, status };
}

function createAttributeSupportRecord(
	attribute: ItemAttributeRecord,
): SupportRecord {
	return {
		code: "",
		description: "",
		detail: attribute.values.join(", "),
		id: attribute.id,
		name: attribute.name,
		status: attribute.status,
		valueEntries: attribute.values,
	};
}

function normalizeAttributeSupportRecord(record: SupportRecord): SupportRecord {
	const valueEntries = (record.valueEntries ?? [])
		.map((value) => value.trim())
		.filter(Boolean);

	return {
		...record,
		code: "",
		description: "",
		detail: valueEntries.join(", "),
		valueEntries,
	};
}

function createEmptyRecord(
	kind: ItemManagementSupportPageKind,
	nextRecordNumber: number,
): SupportRecord {
	const prefixes: Record<ItemManagementSupportPageKind, string> = {
		"item-attributes": "",
		"price-lists": "PL",
		"unit-of-measurement": "UOM",
	};
	const prefix = prefixes[kind];
	const code = prefix
		? `${prefix}-${String(nextRecordNumber).padStart(3, "0")}`
		: "";

	return {
		code,
		description: "",
		detail: "",
		id: `${kind}-${Date.now()}`,
		name: "",
		status: "Active",
		valueEntries: kind === "item-attributes" ? [""] : undefined,
	};
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65";
