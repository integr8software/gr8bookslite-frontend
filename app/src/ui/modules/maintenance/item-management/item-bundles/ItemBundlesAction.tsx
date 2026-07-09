"use client";

import { formatCurrency } from "@/app/src/utils/currency.util";
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
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, GripVertical, Layers, Plus, Save, Trash2 } from "lucide-react";
import { ItemUomDictionary } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import {
	useMemo,
	useEffect,
	useState,
	type CSSProperties,
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";
import type {
	ItemBundleLine,
	ItemRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

const ItemBundlesHref = "/maintenance/item-management/item-bundles";

type BundleMode = "add" | "edit" | "view";

type BundleFormValues = {
	bundlePrice: number;
	code: string;
	name: string;
	status: "Active" | "Inactive";
	lines: ItemBundleLine[];
};

type BundleFormErrors = Partial<
	Record<"bundlePrice" | "code" | "lines" | "name", string>
> & {
	lineErrors?: Record<string, Partial<Record<"itemId" | "quantity", string>>>;
};

export function ItemBundlesAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { addItemBundle, itemBundles, items, updateItemBundle } = useItemManagementStore();
	const mode = getMode(pathname);
	const isReadonly = mode === "view";
	const existingBundle = itemBundles.find((bundle) => bundle.id === params.recordId);
	const itemOptions = useMemo(
		() =>
			items
				.filter((item) => item.status === "Active")
				.map<AppAdvancedDropdownOption>((item) => ({
					label: `${item.code} | ${item.uom}`,
					name: item.name,
					value: item.id,
				})),
		[items],
	);
	const [values, setValues] = useState<BundleFormValues>(() =>
		existingBundle
			? {
					bundlePrice: existingBundle.bundlePrice,
					code: existingBundle.code,
					lines: existingBundle.lines,
					name: existingBundle.name,
					status: existingBundle.status,
				}
			: {
					bundlePrice: 0,
					code: "",
					lines: [createBundleLine()],
					name: "",
					status: "Active",
				},
	);
	const [errors, setErrors] = useState<BundleFormErrors>({});
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);
	const totals = calculateBundleTotals(values.lines, items, values.bundlePrice);

	function updateField<TKey extends keyof BundleFormValues>(
		field: TKey,
		value: BundleFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateLine(lineId: string, update: Partial<ItemBundleLine>) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: current.lines.map((line) =>
				line.id === lineId ? { ...line, ...update } : line,
			),
		}));
		setErrors((current) => {
			const nextLineErrors = { ...current.lineErrors };
			const currentLineErrors = { ...nextLineErrors[lineId] };

			Object.keys(update).forEach((field) => {
				delete currentLineErrors[field as keyof typeof currentLineErrors];
			});
			nextLineErrors[lineId] = currentLineErrors;

			return {
				...current,
				lines: undefined,
				lineErrors: nextLineErrors,
			};
		});
	}

	function addLine() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: [...current.lines, createBundleLine()],
		}));
	}

	function removeLine(lineId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines:
				current.lines.length > 1
					? current.lines.filter((line) => line.id !== lineId)
					: current.lines,
		}));
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id || isReadonly) {
			return;
		}

		setValues((current) => {
			const oldIndex = current.lines.findIndex((line) => line.id === active.id);
			const newIndex = current.lines.findIndex((line) => line.id === over.id);

			if (oldIndex === -1 || newIndex === -1) {
				return current;
			}

			return {
				...current,
				lines: arrayMove(current.lines, oldIndex, newIndex),
			};
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!isReadonly) {
			const nextErrors = validateBundleForm(values, items);

			if (hasBundleErrors(nextErrors)) {
				setErrors(nextErrors);
				return;
			}

			const payload = createBundlePayload(values, existingBundle?.id);

			if (existingBundle) {
				updateItemBundle(payload);
			} else {
				addItemBundle(payload);
			}
			router.push(ItemBundlesHref);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={isReadonly ? values.name || "Item Bundle" : "Item Bundle"}
				description="Create or update a grouped sales item with component quantities and bundle pricing."
				eyebrow={
					<>
						<Layers className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<>
						<Link href={ItemBundlesHref} className={moduleHeaderActionClassNames.secondary}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!isReadonly ? (
							<button type="submit" className={moduleHeaderActionClassNames.primary}>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save Bundle
							</button>
						) : null}
					</>
				}
			/>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">Bundle Information</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<Field label="Bundle Code" error={errors.code} required>
						<input
							value={values.code}
							onChange={(event) => updateField("code", event.target.value)}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="BND-2004"
						/>
					</Field>
					<Field label="Bundle Name" error={errors.name} required>
						<input
							value={values.name}
							onChange={(event) => updateField("name", event.target.value)}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Starter Office Bundle"
						/>
					</Field>
					<Field label="Bundle Price" error={errors.bundlePrice} required>
						<DecimalNumberInput
							value={values.bundlePrice}
							readOnly={isReadonly}
							allowDecimal
							onValueChange={(value) => updateField("bundlePrice", value)}
						/>
					</Field>
					<Field label="Status" required>
						<select
							value={values.status}
							onChange={(event) =>
								updateField("status", event.target.value as BundleFormValues["status"])
							}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option>Active</option>
							<option>Inactive</option>
						</select>
					</Field>
				</div>
			</section>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-base font-semibold text-darknavy">Bundle Items</h2>
						<p className="mt-1 text-sm text-darknavy/55">
							Select component items and quantities. Pricing is set once as the bundle price.
						</p>
					</div>
					{!isReadonly ? (
						<button
							type="button"
							onClick={addLine}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Item
						</button>
					) : null}
				</div>
				<div className="mt-4 overflow-auto">
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<table className="w-full min-w-[73rem] table-fixed text-left text-sm">
							<colgroup>
								<col className="w-12" />
								<col className="w-[28rem]" />
								<col className="w-[8rem]" />
								<col className="w-[9rem]" />
								<col className="w-[9rem]" />
								<col className="w-[7rem]" />
							</colgroup>
							<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
								<tr>
									<th className="px-3 py-3"><span className="sr-only">Order</span></th>
									<th className="px-3 py-3">
										Item Name <span className="text-coralpink">*</span>
									</th>
									<th className="px-3 py-3 text-right">
										Qty <span className="text-coralpink">*</span>
									</th>
									<th className="px-3 py-3 text-right">Original Cost</th>
									<th className="px-3 py-3 text-right">Original Price</th>
									<th className="px-3 py-3 text-center">Actions</th>
								</tr>
							</thead>
							<SortableContext items={values.lines.map((line) => line.id)} strategy={verticalListSortingStrategy}>
								<tbody className="divide-y divide-darknavy/8">
									{values.lines.map((line) => (
										<BundleLineRow
											key={line.id}
											isReadonly={isReadonly}
											item={items.find((currentItem) => currentItem.id === line.itemId)}
											itemOptions={itemOptions}
											lineErrors={errors.lineErrors?.[line.id]}
											line={line}
											onRemove={removeLine}
											onUpdate={updateLine}
										/>
									))}
								</tbody>
							</SortableContext>
						</table>
					</DndContext>
					{errors.lines ? (
						<p className="mt-2 text-sm font-medium text-coralpink">{errors.lines}</p>
					) : null}
				</div>
			</section>
			<section className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:grid-cols-4">
				<SummaryTile label="Original Cost" value={formatCurrency(totals.originalCost)} />
				<SummaryTile label="Original Selling" value={formatCurrency(totals.originalSelling)} />
				<SummaryTile label="Bundle Price" value={formatCurrency(totals.bundleTotal)} />
				<SummaryTile
					label="Customer Savings"
					value={formatCurrency(Math.max(totals.originalSelling - totals.bundleTotal, 0))}
				/>
			</section>
		</form>
	);
}

function BundleLineRow({
	isReadonly,
	item,
	itemOptions,
	lineErrors,
	line,
	onRemove,
	onUpdate,
}: {
	isReadonly: boolean;
	item?: ItemRecord;
	itemOptions: AppAdvancedDropdownOption[];
	lineErrors?: Partial<Record<"itemId" | "quantity", string>>;
	line: ItemBundleLine;
	onRemove: (lineId: string) => void;
	onUpdate: (lineId: string, update: Partial<ItemBundleLine>) => void;
}) {
	const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
		useSortable({ disabled: isReadonly, id: line.id });
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const allowDecimalQuantity = getItemAllowsDecimalQuantity(item);

	return (
		<tr ref={setNodeRef} style={style} className={isDragging ? "relative z-10 bg-skyblue/5 shadow-sm" : undefined}>
			<td className="px-3 py-3">
				<button
					type="button"
					disabled={isReadonly}
					className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy disabled:opacity-30"
					aria-label="Reorder bundle item"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-4 w-4" aria-hidden="true" />
				</button>
			</td>
			<td className="px-3 py-3">
				<AppAdvancedDropdown
					menuPortal
					options={itemOptions}
					placeholder="Select item"
					readOnly={isReadonly}
					showSelectedDetails
					value={line.itemId}
					onChange={(value) => onUpdate(line.id, { itemId: String(value) })}
					onSelectOption={(option) => onUpdate(line.id, { itemId: option.value })}
				/>
				{lineErrors?.itemId ? (
					<p className="mt-1 text-xs font-medium text-coralpink">{lineErrors.itemId}</p>
				) : null}
			</td>
			<td className="px-3 py-3">
				<DecimalNumberInput
					allowDecimal={allowDecimalQuantity}
					value={line.quantity}
					readOnly={isReadonly}
					onValueChange={(value) => onUpdate(line.id, { quantity: value })}
				/>
				{lineErrors?.quantity ? (
					<p className="mt-1 text-xs font-medium text-coralpink">{lineErrors.quantity}</p>
				) : null}
			</td>
			<td className="px-3 py-3 text-right font-semibold">{formatCurrency(item?.costPrice ?? 0)}</td>
			<td className="px-3 py-3 text-right font-semibold">{formatCurrency(item?.sellingPrice ?? 0)}</td>
			<td className="px-3 py-3 text-center">
				<button
					type="button"
					disabled={isReadonly}
					onClick={() => onRemove(line.id)}
					className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-coralpink/30 bg-white text-coralpink transition hover:bg-coralpink/10 disabled:opacity-35"
					aria-label="Remove bundle item"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				</button>
			</td>
		</tr>
	);
}

function Field({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
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
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

function SummaryTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-4">
			<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{label}</div>
			<div className="mt-2 text-lg font-semibold text-darknavy">{value}</div>
		</div>
	);
}

function createBundleLine(item?: ItemRecord): ItemBundleLine {
	return {
		id: `bundle-line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
		itemId: item?.id ?? "",
		quantity: 1,
	};
}

function calculateBundleTotals(
	lines: ItemBundleLine[],
	items: ItemRecord[],
	bundlePrice: number,
) {
	const totals = lines.reduce(
		(totals, line) => {
			const item = items.find((currentItem) => currentItem.id === line.itemId);

			return {
				originalCost: totals.originalCost + line.quantity * (item?.costPrice ?? 0),
				originalSelling:
					totals.originalSelling + line.quantity * (item?.sellingPrice ?? 0),
			};
		},
		{ originalCost: 0, originalSelling: 0 },
	);

	return { ...totals, bundleTotal: bundlePrice };
}

function validateBundleForm(
	values: BundleFormValues,
	items: ItemRecord[],
): BundleFormErrors {
	const errors: BundleFormErrors = {};
	const lineErrors: NonNullable<BundleFormErrors["lineErrors"]> = {};

	if (!values.code.trim()) {
		errors.code = "Bundle code is required.";
	}

	if (!values.name.trim()) {
		errors.name = "Bundle name is required.";
	}

	if (values.bundlePrice <= 0) {
		errors.bundlePrice = "Bundle price must be greater than zero.";
	}

	if (values.lines.length === 0) {
		errors.lines = "Add at least one bundle item.";
	}

	values.lines.forEach((line) => {
		const selectedItem = items.find((item) => item.id === line.itemId);
		const currentErrors: Partial<Record<"itemId" | "quantity", string>> = {};

		if (!line.itemId || !selectedItem) {
			currentErrors.itemId = "Item is required.";
		}

		if (line.quantity <= 0) {
			currentErrors.quantity = "Quantity must be greater than zero.";
		} else if (!getItemAllowsDecimalQuantity(selectedItem) && !Number.isInteger(line.quantity)) {
			currentErrors.quantity = "PCS quantity must be a whole number.";
		}

		if (Object.keys(currentErrors).length > 0) {
			lineErrors[line.id] = currentErrors;
		}
	});

	if (Object.keys(lineErrors).length > 0) {
		errors.lineErrors = lineErrors;
	}

	return errors;
}

function hasBundleErrors(errors: BundleFormErrors) {
	return Boolean(
		errors.bundlePrice ||
			errors.code ||
			errors.lines ||
			errors.name ||
			Object.keys(errors.lineErrors ?? {}).length > 0,
	);
}

function createBundlePayload(values: BundleFormValues, existingId?: string) {
	return {
		bundlePrice: values.bundlePrice,
		code: values.code.trim(),
		id: existingId ?? `bundle-${Date.now()}`,
		lines: values.lines.map((line) => ({
			id: line.id,
			itemId: line.itemId,
			quantity: line.quantity,
		})),
		name: values.name.trim(),
		status: values.status,
	};
}

function getItemAllowsDecimalQuantity(item?: ItemRecord) {
	if (!item) {
		return true;
	}

	const itemUom = ItemUomDictionary.find((uom) => uom.code === item.uom);
	const uomCode = itemUom?.code ?? item.uom;

	return uomCode !== "PCS";
}

function getMode(pathname: string): BundleMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

function DecimalNumberInput({
	allowDecimal,
	readOnly,
	value,
	onValueChange,
}: {
	allowDecimal: boolean;
	readOnly: boolean;
	value: number;
	onValueChange: (value: number) => void;
}) {
	const [draftValue, setDraftValue] = useState(String(value));

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
		setDraftValue(String(value));
	}, [value]);

	function handleChange(nextValue: string) {
		if (/[eE+-]/.test(nextValue)) {
			return;
		}

		if (!allowDecimal && nextValue.includes(".")) {
			return;
		}

		setDraftValue(nextValue);

		if (!nextValue.trim()) {
			return;
		}

		const parsedValue = Number(nextValue);

		if (
			Number.isFinite(parsedValue) &&
			parsedValue >= 0 &&
			(allowDecimal || Number.isInteger(parsedValue))
		) {
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
			step={allowDecimal ? "any" : 1}
			inputMode="decimal"
			value={draftValue}
			readOnly={readOnly}
			onBlur={handleBlur}
			onChange={(event) => handleChange(event.target.value)}
			onKeyDown={handleKeyDown}
			className={`${fieldClassName} text-right`}
		/>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65";
