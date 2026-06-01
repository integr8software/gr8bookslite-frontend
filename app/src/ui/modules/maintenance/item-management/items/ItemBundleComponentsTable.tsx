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
import type { CSSProperties } from "react";
import type {
	ItemBundleComponent,
	ItemBundleComponentItemOption,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemBundleComponentsTableProps = {
	components: ItemBundleComponent[];
	error?: string;
	isReadonly: boolean;
	itemOptions: ItemBundleComponentItemOption[];
	onAddComponent: () => void;
	onReorderComponent: (componentId: string, overComponentId: string) => void;
	onRemoveComponent: (componentId: string) => void;
	onUpdateComponent: (
		componentId: string,
		field: keyof ItemBundleComponent,
		value: string,
	) => void;
};

export function ItemBundleComponentsTable({
	components,
	error,
	isReadonly,
	itemOptions,
	onAddComponent,
	onReorderComponent,
	onRemoveComponent,
	onUpdateComponent,
}: ItemBundleComponentsTableProps) {
	const itemCodeOptions = createItemCodeOptions(itemOptions);
	const itemNameOptions = createItemNameOptions(itemOptions);
	const componentIds = components.map((component) => component.id);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		onReorderComponent(String(active.id), String(over.id));
	}

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Bundle Components
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Add the component items included when this item is used
						as a bundle.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddComponent}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Component
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
					<table className="w-full min-w-[48rem] text-left text-sm">
						<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
							<tr>
								<th className="w-12 px-3 py-3">
									<span className="sr-only">Order</span>
								</th>
								<th className="px-3 py-3">Code</th>
								<th className="px-3 py-3">Item</th>
								<th className="px-3 py-3 text-right">
									Quantity
								</th>
								<th className="px-3 py-3">UOM</th>
								<th className="px-3 py-3 text-right">
									Actions
								</th>
							</tr>
						</thead>
						<SortableContext
							items={componentIds}
							strategy={verticalListSortingStrategy}
						>
							<tbody className="divide-y divide-darknavy/8">
								{components.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-3 py-6 text-center text-sm text-darknavy/55"
										>
											No bundle components added.
										</td>
									</tr>
								) : null}
								{components.map((component) => (
									<BundleComponentRow
										key={component.id}
										component={component}
										isReadonly={isReadonly}
										itemCodeOptions={itemCodeOptions}
										itemNameOptions={itemNameOptions}
										itemOptions={itemOptions}
										onRemoveComponent={onRemoveComponent}
										onUpdateComponent={onUpdateComponent}
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

function BundleComponentRow({
	component,
	isReadonly,
	itemCodeOptions,
	itemNameOptions,
	itemOptions,
	onRemoveComponent,
	onUpdateComponent,
}: {
	component: ItemBundleComponent;
	isReadonly: boolean;
	itemCodeOptions: AppAdvancedDropdownOption[];
	itemNameOptions: AppAdvancedDropdownOption[];
	itemOptions: ItemBundleComponentItemOption[];
	onRemoveComponent: (componentId: string) => void;
	onUpdateComponent: (
		componentId: string,
		field: keyof ItemBundleComponent,
		value: string,
	) => void;
}) {
	const uomOptions = getComponentUomOptions(component, itemOptions);
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		disabled: isReadonly,
		id: component.id,
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
					disabled={isReadonly}
					aria-label={`Drag ${component.itemName || "component"} to reorder`}
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
					options={itemCodeOptions}
					placeholder="Search code"
					readOnly={isReadonly}
					searchPlaceholder="Search item code"
					showSelectedDetails
					value={component.itemId}
					onChange={(value) =>
						onUpdateComponent(component.id, "itemId", String(value))
					}
				/>
			</td>
			<td className="px-3 py-3">
				<AppAdvancedDropdown
					isClearable
					menuPortal
					options={itemNameOptions}
					placeholder="Search item"
					readOnly={isReadonly}
					searchPlaceholder="Search item"
					showSelectedDetails
					value={component.itemId}
					onChange={(value) =>
						onUpdateComponent(component.id, "itemId", String(value))
					}
				/>
			</td>
			<td className="px-3 py-3">
				<input
					type="number"
					min={0}
					value={component.quantity}
					onChange={(event) =>
						onUpdateComponent(
							component.id,
							"quantity",
							event.target.value,
						)
					}
					readOnly={isReadonly}
					className={`${fieldClassName} text-right`}
				/>
			</td>
			<td className="px-3 py-3">
				<select
					value={component.uom}
					onChange={(event) =>
						onUpdateComponent(
							component.id,
							"uom",
							event.target.value,
						)
					}
					disabled={isReadonly || uomOptions.length === 0}
					className={fieldClassName}
				>
					{uomOptions.length === 0 ? (
						<option value="">Select item first</option>
					) : null}
					{uomOptions.map((uom) => (
						<option key={uom} value={uom}>
							{uom}
						</option>
					))}
				</select>
			</td>
			<td className="px-3 py-3 text-right">
				{!isReadonly ? (
					<div className="flex justify-end gap-1">
						<ModuleTableActionButton
							variant="delete"
							label={`Remove ${component.itemName || "component"}`}
							onClick={() => onRemoveComponent(component.id)}
						/>
					</div>
				) : null}
			</td>
		</tr>
	);
}

function createItemCodeOptions(
	itemOptions: ItemBundleComponentItemOption[],
): AppAdvancedDropdownOption[] {
	return itemOptions.map((item) => ({
		description: createItemUomDescription(item),
		label: item.itemName,
		name: item.itemCode,
		value: item.id,
	}));
}

function createItemNameOptions(
	itemOptions: ItemBundleComponentItemOption[],
): AppAdvancedDropdownOption[] {
	return itemOptions.map((item) => ({
		description: createItemUomDescription(item),
		label: item.itemCode,
		name: item.itemName,
		value: item.id,
	}));
}

function getComponentUomOptions(
	component: ItemBundleComponent,
	itemOptions: ItemBundleComponentItemOption[],
) {
	const selectedItem = itemOptions.find(
		(item) => item.id === component.itemId,
	);
	const uomOptions = selectedItem?.uomOptions ?? [];

	if (!component.uom || uomOptions.includes(component.uom)) {
		return uomOptions;
	}

	return [component.uom, ...uomOptions];
}

function createItemUomDescription(item: ItemBundleComponentItemOption) {
	return item.uomOptions.length > 1
		? `Default ${item.itemUom} | Additional ${item.uomOptions
				.filter((uom) => uom !== item.itemUom)
				.join(", ")}`
		: `Default ${item.itemUom}`;
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
