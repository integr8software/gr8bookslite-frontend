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
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	ArrowLeft,
	CheckCircle2,
	CirclePause,
	MapPin,
	MoveRight,
	Plus,
	Save,
	Search,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
	WarehouseAccessPermissionOptions,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { getWarehouseAvailableStock } from "@/app/src/data/modules/maintenance/warehouse-management/WarehouseManagementData";
import { useWarehouseManagementStore } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseManagement";
import type {
	WarehouseAccessLevel,
	WarehouseAccessPermission,
	WarehouseAccessRecord,
	WarehouseRecord,
	WarehouseStatus,
	WarehouseStorageLocation,
	WarehouseTransfer,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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

type WarehouseSupportPageKind =
	| "access"
	| "stock-inquiry"
	| "storage-locations"
	| "transfers";

type EditableSupportKind = Exclude<WarehouseSupportPageKind, "stock-inquiry">;
type ModalMode = "add" | "edit" | "view";

type SupportRecord = {
	id: string;
	kind: WarehouseSupportPageKind;
	recordId: string;
	status: string;
	values: string[];
	warehouseId: string;
};

type SupportFormValues = {
	accessLevel: WarehouseAccessLevel;
	approvedBy: string;
	aisle: string;
	balance: string;
	binNo: string;
	date: string;
	destinationWarehouse: string;
	item: string;
	locationCode: string;
	permissions: WarehouseAccessPermission[];
	quantityIn: string;
	quantityOut: string;
	rackNo: string;
	referenceNumber: string;
	requestedBy: string;
	shelfNo: string;
	sourceWarehouse: string;
	status: string;
	transactionType: string;
	user: string;
	userName: string;
	warehouseId: string;
	zone: string;
};

const PageConfig = {
	access: {
		actionLabel: "Add Access",
		description:
			"Control which users can view, receive, issue, transfer, adjust, manage locations, and view warehouse history.",
		icon: ShieldCheck,
		title: "Warehouse Access",
	},
	"stock-inquiry": {
		actionLabel: "Refresh Inquiry",
		description:
			"View on-hand, reserved, available, and inventory value by warehouse, item, category, brand, supplier, lot, serial, and location.",
		icon: Search,
		title: "Warehouse Stock Inquiry",
	},
	"storage-locations": {
		actionLabel: "Add Location",
		description:
			"Maintain physical warehouse locations by zone, aisle, rack, shelf, bin, and status.",
		icon: MapPin,
		title: "Storage Locations",
	},
	transfers: {
		actionLabel: "Add Transfer",
		description:
			"Track warehouse transfers from draft through submitted, approved, in transit, received, and completed.",
		icon: MoveRight,
		title: "Warehouse Transfers",
	},
} satisfies Record<
	WarehouseSupportPageKind,
	{ actionLabel: string; description: string; icon: typeof Search; title: string }
>;

const WarehouseSupportBaseHref =
	"/maintenance/warehouse-management";

function getSupportPageHref(kind: WarehouseSupportPageKind) {
	return `${WarehouseSupportBaseHref}/${kind}`;
}

function WarehouseSupportIcon({ kind }: { kind: WarehouseSupportPageKind }) {
	const Icon = PageConfig[kind].icon;

	return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function WarehouseSupportPage({ kind }: { kind: WarehouseSupportPageKind }) {
	const config = PageConfig[kind];
	const Icon = config.icon;
	const { isMutating, updateWarehouse, warehouses } = useWarehouseManagementStore();
	const headers = createHeaders(kind);
	const rows = useMemo(() => createRows(kind, warehouses), [kind, warehouses]);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "col0", desc: false },
	]);
	const [pendingDelete, setPendingDelete] = useState<SupportRecord | null>(null);
	const filteredRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return rows.filter(
			(row) =>
				(statusFilter === "All" || row.status === statusFilter) &&
				(!normalizedQuery ||
					[row.status, ...row.values]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, rows, statusFilter]);
	const columns = useMemo<ColumnDef<SupportRecord>[]>(
		() => [
			...headers.map((header, index) => ({
				id: `col${index}`,
				accessorFn: (row: SupportRecord) => row.values[index] ?? "",
				header,
				sortingFn: "alphanumeric" as const,
				meta: { className: getColumnClassName(kind, index) },
			})),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[9rem] text-center" },
			},
		],
		[headers, kind],
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
	const activeRows = rows.filter((row) => row.status === "Active").length;
	const statuses = Array.from(
		new Set(rows.map((row) => row.status).filter(Boolean)),
	).sort((first, second) => first.localeCompare(second));

	function refreshInquiry() {
		if (kind === "stock-inquiry") {
			setQuery("");
			setStatusFilter("All");
			table.setPageIndex(0);
			return;
		}
	}

	function handleDelete() {
		if (!pendingDelete || kind === "stock-inquiry") {
			return;
		}

		const changedWarehouse = removeSupportRecord(
			pendingDelete,
			warehouses,
		);

		if (changedWarehouse) {
			updateWarehouse(changedWarehouse);
		}

		setPendingDelete(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={config.title}
				description={config.description}
				actions={
					kind === "stock-inquiry" ? (
						<button
							type="button"
							className={moduleHeaderActionClassNames.primary}
							onClick={refreshInquiry}
						>
							<Search className="h-4 w-4" aria-hidden="true" />
							{config.actionLabel}
						</button>
					) : (
						<Link
							href={`${getSupportPageHref(kind)}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							{config.actionLabel}
						</Link>
					)
				}
				eyebrow={
					<>
						<Icon className="h-3.5 w-3.5" aria-hidden="true" />
						Warehouse management
					</>
				}
			/>
			<ModuleStatisticCards
				items={[
					{
						helper: "Module records",
						icon: Icon,
						label: "Total Records",
						value: rows.length,
					},
					{
						helper: "Currently active",
						icon: CheckCircle2,
						label: "Active",
						tone: "emerald",
						value: activeRows,
					},
					{
						helper: "Other statuses",
						icon: CirclePause,
						label: "Other",
						tone: "amber",
						value: rows.length - activeRows,
					},
				]}
			/>
			<ModuleTable
				emptyDescription="Try adjusting your filters or add a new warehouse record."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle={`No ${config.title.toLowerCase()} found`}
				minWidthClassName={
					kind === "stock-inquiry" ? "min-w-[104rem]" : "min-w-[78rem]"
				}
				paginationStorageKey={`maintenance.warehouse-management.${kind}`}
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
								...statuses.map((status) => ({
									label: status,
									value: status,
								})),
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
						{headers.map((_, index) => {
							const value = original.values[index] || "-";

							return (
								<td key={index} className="px-4 py-4">
									{value === original.status ? (
										<StatusBadge status={value} />
									) : (
										value
									)}
								</td>
							);
						})}
						<td className="px-4 py-4">
							<ModuleTableActions className="justify-center">
								{kind !== "stock-inquiry" ? (
									<>
										<ModuleTableActionLink
											variant="view"
											href={`${getSupportPageHref(kind)}/view/${original.id}`}
											label="View record"
										/>
										<ModuleTableActionLink
											variant="edit"
											href={`${getSupportPageHref(kind)}/edit/${original.id}`}
											label="Edit record"
										/>
										<ModuleTableActionButton
											icon={Trash2}
											variant="delete"
											label="Remove record"
											onClick={() => setPendingDelete(original)}
										/>
									</>
								) : (
									<span className="text-xs font-semibold text-darknavy/40">
										Read only
									</span>
								)}
							</ModuleTableActions>
						</td>
					</tr>
				)}
			/>
			<AppDialog
				isOpen={Boolean(pendingDelete)}
				isPending={isMutating}
				title="Remove warehouse record?"
				description="This will remove the selected frontend record from the warehouse data."
				confirmLabel="Remove"
				tone="danger"
				onCancel={() => setPendingDelete(null)}
				onConfirm={handleDelete}
			/>
		</section>
	);
}

export function WarehouseSupportActionPage({
	kind,
}: {
	kind: EditableSupportKind;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const mode = getActionMode(pathname);
	const { isMutating, updateWarehouse, warehouses } = useWarehouseManagementStore();
	const rows = useMemo(() => createRows(kind, warehouses), [kind, warehouses]);
	const row = rows.find((currentRow) => currentRow.id === params.recordId);
	const needsRecord = mode !== "add";
	const [form, setForm] = useState<SupportFormValues>(() =>
		needsRecord && row
			? createFormFromRow(row, warehouses)
			: createBlankForm(kind, warehouses),
	);

	if (needsRecord && !row) {
		return (
			<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
				<h1 className="text-xl font-semibold text-darknavy">
					Warehouse record not found
				</h1>
				<p className="mt-2 text-sm text-darknavy/55">
					The selected record may have been removed or is no longer available.
				</p>
				<Link
					href={getSupportPageHref(kind)}
					className={`${moduleHeaderActionClassNames.secondary} mt-5`}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			</section>
		);
	}

	function handleSave(nextForm: SupportFormValues) {
		const nextWarehouses = upsertSupportRecord({
			form: nextForm,
			kind,
			mode,
			row,
			warehouses,
		});
		const changedWarehouses = nextWarehouses.filter(
			(warehouse, index) => warehouse !== warehouses[index],
		);

		changedWarehouses.forEach((changedWarehouse) => {
			updateWarehouse(changedWarehouse);
		});

		router.push(getSupportPageHref(kind));
	}

	return (
		<SupportRecordForm
			form={form}
			isPending={isMutating}
			kind={kind}
			mode={mode}
			row={row}
			warehouses={warehouses}
			onChange={setForm}
			onSave={handleSave}
		/>
	);
}

function SupportRecordForm({
	form,
	isPending,
	kind,
	mode,
	onChange,
	onSave,
	row,
	warehouses,
}: {
	form: SupportFormValues;
	isPending: boolean;
	kind: EditableSupportKind;
	mode: ModalMode;
	row?: SupportRecord;
	warehouses: WarehouseRecord[];
	onChange: (form: SupportFormValues) => void;
	onSave: (form: SupportFormValues) => void;
}) {
	const values = form;
	const isReadonly = mode === "view";
	const title =
		mode === "add"
			? PageConfig[kind].actionLabel
			: mode === "edit"
				? `Edit ${PageConfig[kind].title}`
				: `${PageConfig[kind].title} Details`;

	function updateField<TKey extends keyof SupportFormValues>(
		field: TKey,
		value: SupportFormValues[TKey],
	) {
		onChange({ ...values, [field]: value });
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!isReadonly) {
			onSave(values);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={title}
				description={
					isReadonly
						? "Review the selected warehouse record."
						: "Fill in the warehouse record details."
				}
				eyebrow={
					<>
						<WarehouseSupportIcon kind={kind} />
						Warehouse management
					</>
				}
				actions={
					<>
						<Link
							href={getSupportPageHref(kind)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button
								type="submit"
								disabled={isPending}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
						) : null}
					</>
				}
			/>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="grid gap-4 md:grid-cols-2">
					{renderSupportFields({
						isReadonly,
						kind,
						row,
						updateField,
						values,
						warehouses,
					})}
				</div>
			</section>
		</form>
	);
}

function renderSupportFields({
	isReadonly,
	kind,
	row,
	updateField,
	values,
	warehouses,
}: {
	isReadonly: boolean;
	kind: WarehouseSupportPageKind;
	row?: SupportRecord;
	values: SupportFormValues;
	warehouses: WarehouseRecord[];
	updateField: <TKey extends keyof SupportFormValues>(
		field: TKey,
		value: SupportFormValues[TKey],
	) => void;
}) {
	if (kind === "access") {
		return (
			<>
				<WarehouseSelect
					readOnly={isReadonly}
					value={values.warehouseId}
					warehouses={warehouses}
					onChange={(value) => updateField("warehouseId", value)}
				/>
				<TextField
					label="User"
					readOnly={isReadonly}
					value={values.userName}
					onChange={(value) => updateField("userName", value)}
				/>
				<SelectField
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={["Active", "Inactive"]}
					onChange={(value) => updateField("status", value)}
				/>
				<PermissionField
					readOnly={isReadonly}
					value={values.permissions}
					onChange={(value) => updateField("permissions", value)}
				/>
			</>
		);
	}

	if (kind === "storage-locations") {
		return (
			<>
				<WarehouseSelect
					readOnly={isReadonly}
					value={values.warehouseId}
					warehouses={warehouses}
					onChange={(value) => updateField("warehouseId", value)}
				/>
				<TextField
					label="Location Code"
					readOnly={isReadonly}
					value={values.locationCode}
					onChange={(value) => updateField("locationCode", value)}
				/>
				<TextField label="Zone" readOnly={isReadonly} value={values.zone} onChange={(value) => updateField("zone", value)} />
				<TextField label="Aisle" readOnly={isReadonly} value={values.aisle} onChange={(value) => updateField("aisle", value)} />
				<TextField label="Rack No" readOnly={isReadonly} value={values.rackNo} onChange={(value) => updateField("rackNo", value)} />
				<TextField label="Shelf No" readOnly={isReadonly} value={values.shelfNo} onChange={(value) => updateField("shelfNo", value)} />
				<TextField label="Bin No" readOnly={isReadonly} value={values.binNo} onChange={(value) => updateField("binNo", value)} />
				<SelectField
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={["Active", "Inactive"]}
					onChange={(value) => updateField("status", value)}
				/>
			</>
		);
	}

	if (kind === "transfers") {
		return (
			<>
				<WarehouseSelect readOnly={isReadonly} label="Source Warehouse" value={values.warehouseId} warehouses={warehouses} onChange={(value) => updateField("warehouseId", value)} />
				<TextField label="Date" readOnly={isReadonly} type="date" value={values.date} onChange={(value) => updateField("date", value)} />
				<TextField label="Transfer Number" readOnly={isReadonly} value={values.referenceNumber} onChange={(value) => updateField("referenceNumber", value)} />
				<TextField label="Destination Warehouse" readOnly={isReadonly} value={values.destinationWarehouse} onChange={(value) => updateField("destinationWarehouse", value)} />
				<TextField label="Requested By" readOnly={isReadonly} value={values.requestedBy} onChange={(value) => updateField("requestedBy", value)} />
				<TextField label="Approved By" readOnly={isReadonly} value={values.approvedBy} onChange={(value) => updateField("approvedBy", value)} />
				<SelectField
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={["Draft", "Submitted", "Approved", "In Transit", "Received", "Completed"]}
					onChange={(value) => updateField("status", value)}
				/>
			</>
		);
	}

	return (
		<>
			{createHeaders(kind).map((header, index) => (
				<TextField
					key={header}
					label={header}
					readOnly
					value={row?.values[index] ?? ""}
					onChange={() => undefined}
				/>
			))}
		</>
	);
}

function TextField({
	label,
	onChange,
	readOnly,
	type = "text",
	value,
}: {
	label: string;
	readOnly: boolean;
	type?: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				readOnly={readOnly}
				className={fieldClassName}
			/>
		</label>
	);
}

function SelectField({
	label,
	onChange,
	options,
	readOnly,
	value,
}: {
	label: string;
	options: string[];
	readOnly: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={readOnly}
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

function WarehouseSelect({
	label = "Warehouse",
	onChange,
	readOnly,
	value,
	warehouses,
}: {
	label?: string;
	readOnly: boolean;
	value: string;
	warehouses: WarehouseRecord[];
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={readOnly}
				className={fieldClassName}
			>
				{warehouses.map((warehouse) => (
					<option key={warehouse.id} value={warehouse.id}>
						{warehouse.name}
					</option>
				))}
			</select>
		</label>
	);
}

function PermissionField({
	onChange,
	readOnly,
	value,
}: {
	readOnly: boolean;
	value: WarehouseAccessPermission[];
	onChange: (value: WarehouseAccessPermission[]) => void;
}) {
	return (
		<fieldset className="grid gap-2 md:col-span-2">
			<legend className="text-sm font-semibold text-darknavy">Permissions</legend>
			<div className="grid gap-2 rounded-md border border-darknavy/10 p-3 sm:grid-cols-2">
				{WarehouseAccessPermissionOptions.map((permission) => (
					<label key={permission} className="flex items-center gap-2 text-sm font-medium text-darknavy">
						<input
							type="checkbox"
							checked={value.includes(permission)}
							disabled={readOnly}
							onChange={(event) => {
								onChange(
									event.target.checked
										? [...value, permission]
										: value.filter((current) => current !== permission),
								);
							}}
							className="h-4 w-4 accent-skyblue"
						/>
						{permission}
					</label>
				))}
			</div>
		</fieldset>
	);
}

function createHeaders(kind: WarehouseSupportPageKind) {
	if (kind === "access") {
		return ["Warehouse", "User", "Permissions", "Status"];
	}

	if (kind === "storage-locations") {
		return [
			"Warehouse",
			"Zone",
			"Aisle",
			"Rack No",
			"Shelf No",
			"Bin No",
			"Location Code",
			"Status",
		];
	}

	if (kind === "stock-inquiry") {
		return [
			"Warehouse",
			"Item",
			"Category",
			"UOM",
			"On Hand",
			"Reserved",
			"Available",
			"Inventory Value",
			"Lot No.",
			"Serial No.",
			"Storage Location",
		];
	}

	return [
		"Date",
		"Transfer Number",
		"Source Warehouse",
		"Destination Warehouse",
		"Requested By",
		"Approved By",
		"Status",
	];
}

function createRows(kind: WarehouseSupportPageKind, warehouses: WarehouseRecord[]) {
	if (kind === "access") {
		return warehouses.flatMap((warehouse) =>
			warehouse.access.map((access) =>
				createRecord(kind, warehouse.id, access.id, [
					warehouse.name,
					access.userName,
					access.permissions.join(", "),
					access.status,
				]),
			),
		);
	}

	if (kind === "storage-locations") {
		return warehouses.flatMap((warehouse) =>
			warehouse.locations.map((location) =>
				createRecord(kind, warehouse.id, location.id, [
					warehouse.name,
					location.zone || "-",
					location.aisle || "-",
					location.rackNo || "-",
					location.shelfNo || "-",
					location.binNo || "-",
					location.locationCode,
					location.status,
				]),
			),
		);
	}

	if (kind === "stock-inquiry") {
		return warehouses.flatMap((warehouse) =>
			warehouse.items.map((item) =>
				createRecord(kind, warehouse.id, item.id, [
					warehouse.name,
					item.itemName,
					item.category,
					item.uom,
					String(item.onHand),
					String(item.reserved),
					String(getWarehouseAvailableStock(item)),
					formatCurrency(item.onHand * item.unitCost),
					item.lotNumber || "-",
					item.serialNumber || "-",
					item.storageLocation || "-",
				]),
			),
		);
	}

	return warehouses.flatMap((warehouse) =>
		warehouse.transfers.map((transfer) =>
			createRecord(kind, warehouse.id, transfer.id, [
				transfer.date,
				transfer.referenceNumber,
				transfer.sourceWarehouse,
				transfer.destinationWarehouse,
				transfer.requestedBy,
				transfer.approvedBy,
				transfer.status,
			]),
		),
	);
}

function createRecord(
	kind: WarehouseSupportPageKind,
	warehouseId: string,
	recordId: string,
	values: string[],
): SupportRecord {
	const status =
		values.find((value) =>
			[
				"Active",
				"Inactive",
				"Draft",
				"Submitted",
				"Approved",
				"In Transit",
				"Received",
				"Completed",
			].includes(value),
		) ?? "Active";

	return {
		id: `${kind}-${warehouseId}-${recordId}`,
		kind,
		recordId,
		status,
		values,
		warehouseId,
	};
}

function createBlankForm(
	kind: EditableSupportKind,
	warehouses: WarehouseRecord[],
): SupportFormValues {
	const firstWarehouse = warehouses[0];

	return {
		accessLevel: "Viewer",
		approvedBy: "",
		aisle: "",
		balance: "0",
		binNo: "",
		date: new Date().toISOString().slice(0, 10),
		destinationWarehouse:
			warehouses.find((warehouse) => warehouse.id !== firstWarehouse?.id)?.name ??
			"",
		item: "",
		locationCode: "",
		permissions: ["View Stock"],
		quantityIn: "0",
		quantityOut: "0",
		rackNo: "",
		referenceNumber: createReferenceNumber(kind),
		requestedBy: "",
		shelfNo: "",
		sourceWarehouse: firstWarehouse?.name ?? "",
		status: kind === "transfers" ? "Draft" : "Active",
		transactionType: "",
		user: "",
		userName: "",
		warehouseId: firstWarehouse?.id ?? "",
		zone: "",
	};
}

function createFormFromRow(
	row: SupportRecord,
	warehouses: WarehouseRecord[],
): SupportFormValues {
	const form = createBlankForm(toEditableKind(row.kind), warehouses);
	const warehouse = warehouses.find((current) => current.id === row.warehouseId);

	if (!warehouse) {
		return form;
	}

	if (row.kind === "access") {
		const record = warehouse.access.find((access) => access.id === row.recordId);

		return record
			? {
					...form,
					accessLevel: record.accessLevel,
					permissions: record.permissions,
					status: record.status,
					userName: record.userName,
					warehouseId: warehouse.id,
				}
			: form;
	}

	if (row.kind === "storage-locations") {
		const record = warehouse.locations.find(
			(location) => location.id === row.recordId,
		);

		return record
			? {
					...form,
					aisle: record.aisle,
					binNo: record.binNo,
					locationCode: record.locationCode,
					rackNo: record.rackNo,
					shelfNo: record.shelfNo,
					status: record.status,
					warehouseId: warehouse.id,
					zone: record.zone,
				}
			: form;
	}

	if (row.kind === "transfers") {
		const record = warehouse.transfers.find(
			(transfer) => transfer.id === row.recordId,
		);

		return record
			? {
					...form,
					approvedBy: record.approvedBy,
					date: record.date,
					destinationWarehouse: record.destinationWarehouse,
					referenceNumber: record.referenceNumber,
					requestedBy: record.requestedBy,
					sourceWarehouse: record.sourceWarehouse,
					status: record.status,
					warehouseId: warehouse.id,
				}
			: form;
	}

	return {
		...form,
		item: row.values[1] ?? "",
		locationCode: row.values[10] ?? "",
		warehouseId: warehouse.id,
	};
}

function toEditableKind(kind: WarehouseSupportPageKind): EditableSupportKind {
	if (kind === "stock-inquiry") {
		return "storage-locations";
	}

	return kind as EditableSupportKind;
}

function upsertSupportRecord({
	form,
	kind,
	mode,
	row,
	warehouses,
}: {
	form: SupportFormValues;
	kind: EditableSupportKind;
	mode: ModalMode;
	row?: SupportRecord;
	warehouses: WarehouseRecord[];
}) {
	const targetWarehouseId = form.warehouseId || row?.warehouseId;

	return warehouses.map((warehouse) => {
		if (warehouse.id !== targetWarehouseId) {
			if (mode === "edit" && row?.warehouseId === warehouse.id) {
				return removeRecordFromWarehouse(warehouse, kind, row.recordId);
			}

			return warehouse;
		}

		return upsertRecordIntoWarehouse(warehouse, kind, form, row?.recordId);
	});
}

function upsertRecordIntoWarehouse(
	warehouse: WarehouseRecord,
	kind: EditableSupportKind,
	form: SupportFormValues,
	recordId?: string,
): WarehouseRecord {
	if (kind === "access") {
		const record: WarehouseAccessRecord = {
			accessLevel: form.accessLevel,
			id: recordId ?? `access-${Date.now()}`,
			permissions: form.permissions,
			status: normalizeStatus(form.status),
			userName: form.userName.trim(),
		};

		return {
			...warehouse,
			access: upsertById(warehouse.access, record),
		};
	}

	if (kind === "storage-locations") {
		const record: WarehouseStorageLocation = {
			aisle: form.aisle.trim(),
			binNo: form.binNo.trim(),
			id: recordId ?? `loc-${Date.now()}`,
			locationCode: form.locationCode.trim() || createLocationCode(form),
			rackNo: form.rackNo.trim(),
			shelfNo: form.shelfNo.trim(),
			status: normalizeStatus(form.status),
			warehouseId: warehouse.id,
			warehouseName: warehouse.name,
			zone: form.zone.trim(),
		};

		return {
			...warehouse,
			locations: upsertById(warehouse.locations, record),
		};
	}

	const record: WarehouseTransfer = {
		approvedBy: form.approvedBy.trim(),
		date: form.date,
		destinationWarehouse: form.destinationWarehouse.trim(),
		id: recordId ?? `transfer-${Date.now()}`,
		referenceNumber: form.referenceNumber.trim(),
		requestedBy: form.requestedBy.trim(),
		sourceWarehouse: warehouse.name,
		status: form.status,
	};

	return {
		...warehouse,
		transfers: upsertById(warehouse.transfers, record),
	};
}

function removeSupportRecord(row: SupportRecord, warehouses: WarehouseRecord[]) {
	return warehouses
		.map((warehouse) =>
			warehouse.id === row.warehouseId && row.kind !== "stock-inquiry"
				? removeRecordFromWarehouse(
						warehouse,
						row.kind as EditableSupportKind,
						row.recordId,
					)
				: warehouse,
		)
		.find((warehouse, index) => warehouse !== warehouses[index]);
}

function removeRecordFromWarehouse(
	warehouse: WarehouseRecord,
	kind: EditableSupportKind,
	recordId: string,
): WarehouseRecord {
	if (kind === "access") {
		return {
			...warehouse,
			access: warehouse.access.filter((record) => record.id !== recordId),
		};
	}

	if (kind === "storage-locations") {
		return {
			...warehouse,
			locations: warehouse.locations.filter((record) => record.id !== recordId),
		};
	}

	return {
		...warehouse,
		transfers: warehouse.transfers.filter((record) => record.id !== recordId),
	};
}

function upsertById<TRecord extends { id: string }>(
	records: TRecord[],
	record: TRecord,
) {
	const exists = records.some((current) => current.id === record.id);

	return exists
		? records.map((current) => (current.id === record.id ? record : current))
		: [...records, record];
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
				status === "Active" || status === "Completed" || status === "Received"
					? "bg-emerald-50 text-emerald-700"
					: status === "Inactive"
						? "bg-amber-50 text-amber-700"
						: "bg-skyblue/12 text-darknavy"
			}`}
		>
			{status}
		</span>
	);
}

function getColumnClassName(kind: WarehouseSupportPageKind, index: number) {
	if (kind === "stock-inquiry") {
		return index === 1 ? "w-[16rem]" : "w-[10rem]";
	}

	return index === 0 ? "w-[14rem]" : "w-[11rem]";
}

function normalizeStatus(status: string): WarehouseStatus {
	return status === "Inactive" ? "Inactive" : "Active";
}

function createLocationCode(form: SupportFormValues) {
	return [form.zone, form.rackNo, form.shelfNo, form.binNo]
		.map((part) => part.trim())
		.filter(Boolean)
		.join("-");
}

function createReferenceNumber(kind: EditableSupportKind) {
	const prefix =
		kind === "transfers"
			? "WT"
			: kind === "storage-locations"
				? "LOC"
				: "ACC";

	return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function getActionMode(pathname: string): ModalMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-US", {
		currency: "PHP",
		style: "currency",
	}).format(value);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
