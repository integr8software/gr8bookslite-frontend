import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import {
	useEffect,
	useState,
	type CSSProperties,
	type KeyboardEvent,
} from "react";
import type { ItemSupplierAssignment } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemSuppliersTableProps = {
	error?: string;
	isReadonly: boolean;
	supplierOptions: AppAdvancedDropdownOption[];
	suppliers: ItemSupplierAssignment[];
	onAddSupplier: () => void;
	onReorderSupplier: (supplierId: string, overSupplierId: string) => void;
	onRemoveSupplier: (supplierId: string) => void;
	onUpdateSupplier: (
		supplierId: string,
		field: keyof ItemSupplierAssignment,
		value: string | boolean,
	) => void;
};

export function ItemSuppliersTable({
	error,
	isReadonly,
	onAddSupplier,
	onReorderSupplier,
	onRemoveSupplier,
	onUpdateSupplier,
	supplierOptions,
	suppliers,
}: ItemSuppliersTableProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const supplierIds = suppliers.map((supplier) => supplier.id);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		onReorderSupplier(String(active.id), String(over.id));
	}

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Suppliers
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Maintain supplier order and the default supplier for
						this item.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddSupplier}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Supplier
					</button>
				) : null}
			</div>
			{error ? (
				<p className="mt-3 text-sm font-medium text-coralpink">
					{error}
				</p>
			) : null}
			<div className="mt-4 overflow-auto">
				<DndContext
					collisionDetection={closestCenter}
					sensors={sensors}
					onDragEnd={handleDragEnd}
				>
					<table className="w-full min-w-[68rem] table-fixed text-left text-sm">
						<colgroup>
							<col className="w-12" />
							<col className="w-[18rem]" />
							<col className="w-[14rem]" />
							<col className="w-[10rem]" />
							<col className="w-[10rem]" />
							<col className="w-[7rem]" />
							<col className="w-[7rem]" />
						</colgroup>
						<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
							<tr>
								<th className="px-3 py-3">
									<span className="sr-only">Order</span>
								</th>
								<th className="px-3 py-3">Supplier</th>
								<th className="px-3 py-3">Supplier Item Code</th>
								<th className="px-3 py-3">Lead Time</th>
								<th className="px-3 py-3">Cost</th>
								<th className="px-3 py-3 text-center">
									Default
								</th>
								<th className="px-3 py-3 text-center">
									Actions
								</th>
							</tr>
						</thead>
						<SortableContext
							items={supplierIds}
							strategy={verticalListSortingStrategy}
						>
							<tbody className="divide-y divide-darknavy/8">
								{suppliers.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className="px-3 py-6 text-center text-sm text-darknavy/55"
										>
											No suppliers added.
										</td>
									</tr>
								) : null}
								{suppliers.map((supplier) => (
									<SupplierRow
										key={supplier.id}
										isReadonly={isReadonly}
										supplier={supplier}
										supplierOptions={supplierOptions}
										onRemoveSupplier={onRemoveSupplier}
										onUpdateSupplier={onUpdateSupplier}
									/>
								))}
							</tbody>
						</SortableContext>
					</table>
				</DndContext>
			</div>
		</div>
	);
}

function SupplierRow({
	isReadonly,
	onRemoveSupplier,
	onUpdateSupplier,
	supplier,
	supplierOptions,
}: {
	isReadonly: boolean;
	supplier: ItemSupplierAssignment;
	supplierOptions: AppAdvancedDropdownOption[];
	onRemoveSupplier: (supplierId: string) => void;
	onUpdateSupplier: (
		supplierId: string,
		field: keyof ItemSupplierAssignment,
		value: string | boolean,
	) => void;
}) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		disabled: isReadonly || supplier.isDefault,
		id: supplier.id,
	});
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<tr
			ref={setNodeRef}
			style={style}
			className={
				isDragging ? "relative z-10 bg-skyblue/5 shadow-sm" : undefined
			}
		>
			<td className="px-3 py-3">
				<button
					type="button"
					disabled={isReadonly || supplier.isDefault}
					aria-label={
						supplier.isDefault
							? `${supplier.supplier || "Default supplier"} stays at the top`
							: `Drag ${supplier.supplier || "supplier"} to reorder`
					}
					className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30 disabled:cursor-default disabled:opacity-30"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-4 w-4" aria-hidden="true" />
				</button>
			</td>
			<td className="px-3 py-3">
				<AppAdvancedDropdown
					isClearable
					menuPortal
					options={supplierOptions}
					placeholder="Select supplier"
					readOnly={isReadonly}
					value={supplier.supplier}
					onChange={(value) =>
						onUpdateSupplier(supplier.id, "supplier", String(value))
					}
				/>
			</td>
			<td className="px-3 py-3">
				<input
					value={supplier.supplierItemCode}
					onChange={(event) =>
						onUpdateSupplier(
							supplier.id,
							"supplierItemCode",
							event.target.value,
						)
					}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Supplier SKU"
				/>
			</td>
			<td className="px-3 py-3">
				<input
					value={supplier.leadTime}
					onChange={(event) =>
						onUpdateSupplier(supplier.id, "leadTime", event.target.value)
					}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="3 days"
				/>
			</td>
			<td className="px-3 py-3">
				<DecimalNumberInput
					value={supplier.lastCost}
					readOnly={isReadonly}
					onValueChange={(value) =>
						onUpdateSupplier(supplier.id, "lastCost", String(value))
					}
				/>
			</td>
			<td className="px-3 py-3 text-center">
				<input
					type="radio"
					checked={supplier.isDefault}
					onChange={() =>
						onUpdateSupplier(supplier.id, "isDefault", true)
					}
					disabled={isReadonly}
					aria-label={`Set ${supplier.supplier || "supplier"} as default`}
					className="h-4 w-4 accent-skyblue disabled:cursor-default"
				/>
			</td>
			<td className="px-3 py-3 text-center">
				<div className="flex justify-center gap-1">
					{!isReadonly ? (
						<ModuleTableActionButton
							variant="delete"
							label="Remove supplier"
							onClick={() => onRemoveSupplier(supplier.id)}
						/>
					) : null}
				</div>
			</td>
		</tr>
	);
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65";

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

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
		setDraftValue(String(value));
	}, [value]);

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault();
		}
	}

	function handleChange(value: string) {
		if (/[eE+-]/.test(value)) {
			return;
		}

		setDraftValue(value);

		if (!value.trim()) {
			return;
		}

		const nextValue = Number(value);

		if (Number.isFinite(nextValue) && nextValue >= 0) {
			onValueChange(nextValue);
		}
	}

	function handleBlur() {
		if (!draftValue.trim()) {
			onValueChange(0);
			setDraftValue("0");
		}
	}

	return (
		<input
			type="number"
			min={0}
			step="any"
			inputMode="decimal"
			value={draftValue}
			onBlur={handleBlur}
			onChange={(event) => handleChange(event.target.value)}
			onKeyDown={handleKeyDown}
			readOnly={readOnly}
			className={fieldClassName}
		/>
	);
}
