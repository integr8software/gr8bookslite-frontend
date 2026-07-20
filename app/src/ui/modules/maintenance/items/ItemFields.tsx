import {
	useEffect,
	useState,
	type ChangeEventHandler,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { formatCurrency } from "@/app/src/utils/currency.util";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import {
	ItemTaxTreatmentSelectOptions,
	VatExclusiveTaxMultiplier,
} from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type {
	ItemBehavior,
	ItemFormErrors,
	ItemFormValues,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppRadioGroup } from "@/app/src/ui/shared/app/AppRadioGroup";
import { ItemTagsInput } from "@/app/src/ui/modules/maintenance/items/ItemTagsInput";

export type ItemFieldsProps = {
	categoryOptions: AppAdvancedDropdownOption[];
	errors: ItemFormErrors;
	isReadonly: boolean;
	responsibilityCenterOptions: AppAdvancedDropdownOption[];
	statusOptions: AppAdvancedDropdownOption[];
	uomOptions: AppAdvancedDropdownOption[];
	values: ItemFormValues;
	warehouseItemsHref?: string;
	warehouseOptions: AppAdvancedDropdownOption[];
	onAddTag: (tag: string) => void;
	onFieldChange: <TKey extends keyof ItemFormValues>(
		field: TKey,
		value: ItemFormValues[TKey],
	) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onRemoveTag: (tag: string) => void;
};

export function ItemFields(props: ItemFieldsProps) {
	return (
		<div className="grid gap-5">
			<ItemInformationFields {...props} />
			<ItemBehaviorFields {...props} />
			<ItemInventoryFields {...props} />
			<ItemPricingTaxFields {...props} />
		</div>
	);
}

export function ItemInformationFields({
	categoryOptions,
	errors,
	isReadonly,
	onAddTag,
	onFieldChange,
	onInputChange,
	onRemoveTag,
	responsibilityCenterOptions,
	uomOptions,
	values,
}: ItemFieldsProps) {
	return (
		<FieldPanel title="Basic Information">
			<FormField label="Item Code" error={errors.code} required>
				<input
					name="code"
					value={values.code}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="ITEM-000123"
				/>
			</FormField>
			<FormField label="SKU Code" error={errors.skuCode}>
				<input
					name="skuCode"
					value={values.skuCode}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="SKU-000123"
				/>
			</FormField>
			<FormField label="Item Name" error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Item name"
				/>
			</FormField>
			<FormField label="Barcode" error={errors.barcode}>
				<input
					name="barcode"
					value={values.barcode}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Barcode"
				/>
			</FormField>
			<FormField label="Category" error={errors.primaryCategory} required>
				<AppAdvancedDropdown
					options={categoryOptions}
					placeholder="--Select Category--"
					readOnly={isReadonly}
					value={values.primaryCategory}
					onChange={(value) => onFieldChange("primaryCategory", String(value))}
				/>
			</FormField>
			<FormField label="Unit of Measurement" error={errors.uom} required>
				<AppAdvancedDropdown
					options={uomOptions}
					readOnly={isReadonly}
					value={values.uom}
					onChange={(value) => onFieldChange("uom", String(value))}
				/>
			</FormField>
			<FormField label="Brand" error={errors.brand}>
				<input
					name="brand"
					value={values.brand}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Brand"
				/>
			</FormField>
			<FormField label="Model" error={errors.model}>
				<input
					name="model"
					value={values.model}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Model, series, or variant"
				/>
			</FormField>
			<FormField
				label="External Reference Code"
				error={errors.externalReferenceCode}
			>
				<input
					name="externalReferenceCode"
					value={values.externalReferenceCode}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Marketplace, legacy, or external system code"
				/>
			</FormField>
			<FormField
				label="Responsibility / Cost Center"
				error={errors.responsibilityCenter}
			>
				<AppAdvancedDropdown
					isClearable
					options={responsibilityCenterOptions}
					placeholder="--Select Cost Center--"
					readOnly={isReadonly}
					value={values.responsibilityCenter}
					onChange={(value) =>
						onFieldChange("responsibilityCenter", String(value))
					}
				/>
			</FormField>
			<FormField label="Description" error={errors.description} wide>
				<AppLimitedTextarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={`${fieldClassName} min-h-24 max-h-40 resize-y py-3`}
					placeholder="Item notes"
				/>
			</FormField>
			<FormField label="Tags" error={errors.tags} wide>
				<ItemTagsInput
					isReadonly={isReadonly}
					tags={values.tags}
					onAddTag={onAddTag}
					onRemoveTag={onRemoveTag}
				/>
			</FormField>
		</FieldPanel>
	);
}

export function ItemBehaviorFields({
	errors,
	isReadonly,
	onFieldChange,
	values,
}: ItemFieldsProps) {
	function handleBehaviorChange(behavior: ItemBehavior) {
		if (isReadonly) {
			return;
		}

		onFieldChange("behavior", behavior);

		const flags = ItemBehaviorFlagMap[behavior];
		onFieldChange("sellable", flags.sellable);
		onFieldChange("purchasable", flags.purchasable);
		onFieldChange("trackInventory", flags.trackInventory);
		onFieldChange("service", flags.service);
		onFieldChange("asset", flags.asset);
	}

	return (
		<FieldPanel title="Item Behavior">
			<div className="grid gap-3 lg:col-span-2 lg:grid-cols-3">
				{ItemBehaviorGuide.map((behavior) => (
					<button
						key={behavior.title}
						aria-pressed={values.behavior === behavior.title}
						disabled={isReadonly}
						type="button"
						className={[
							"min-h-20 rounded-md border p-3 text-left transition",
							values.behavior === behavior.title
								? "border-skyblue bg-skyblue/5 ring-2 ring-skyblue/15"
								: "border-darknavy/10 bg-offwhite/55 hover:border-skyblue/55 hover:bg-skyblue/5",
							isReadonly ? "cursor-default opacity-75" : "cursor-pointer",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => handleBehaviorChange(behavior.title)}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="text-sm font-semibold text-darknavy">
								{behavior.title}
							</div>
							<span
								className={[
									"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
									values.behavior === behavior.title
										? "border-skyblue bg-skyblue text-white"
										: "border-darknavy/15 bg-white",
								]
									.filter(Boolean)
									.join(" ")}
							>
								{values.behavior === behavior.title ? (
									<Check className="h-3.5 w-3.5" aria-hidden="true" />
								) : null}
							</span>
						</div>
						<p className="mt-1 text-xs leading-5 text-darknavy/65">
							{behavior.description}
						</p>
					</button>
				))}
			</div>
			<FormField label="Status" error={errors.status} required>
				<AppRadioGroup<ItemStatus>
					name="item-status"
					options={ItemStatusRadioOptions}
					readOnly={isReadonly}
					value={values.status}
					onChange={(value) =>
						onFieldChange("status", value)
					}
				/>
			</FormField>
		</FieldPanel>
	);
}

export function ItemPricingTaxFields({
	errors,
	isReadonly,
	onFieldChange,
	onInputChange,
	values,
}: ItemFieldsProps) {
	const suggestedSellingPrice = createSuggestedSellingPrice(values);

	return (
		<FieldPanel title="Pricing and Tax">
			<FormField label="Cost" error={errors.costPrice}>
				<DecimalNumberInput
					name="costPrice"
					value={values.costPrice}
					readOnly={isReadonly}
					onValueChange={(value) => onFieldChange("costPrice", value)}
				/>
			</FormField>
			<FormField label="Suggested Price">
				<div className="flex min-h-11 items-center rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy">
					{formatCurrency(suggestedSellingPrice)}
				</div>
			</FormField>
			<FormField label="Selling Price" error={errors.sellingPrice}>
				<DecimalNumberInput
					name="sellingPrice"
					value={values.sellingPrice}
					readOnly={isReadonly}
					onValueChange={(value) => onFieldChange("sellingPrice", value)}
				/>
			</FormField>
			<FormField label="Tax Treatment" error={errors.taxTreatment}>
				<select
					name="taxTreatment"
					value={values.taxTreatment}
					onChange={onInputChange}
					disabled={isReadonly}
					className={fieldClassName}
				>
					{ItemTaxTreatmentSelectOptions.map((taxTreatment) => (
						<option key={taxTreatment.value} value={taxTreatment.value}>
							{taxTreatment.label}
						</option>
					))}
				</select>
			</FormField>
		</FieldPanel>
	);
}

export function ItemInventoryFields({
	errors,
	isReadonly,
	onFieldChange,
	onInputChange,
	values,
	warehouseItemsHref,
	warehouseOptions,
}: ItemFieldsProps) {
	return (
		<FieldPanel title="Inventory">
			<FormField label="Default Warehouse" error={errors.defaultWarehouse}>
				<AppAdvancedDropdown
					isClearable
					options={warehouseOptions}
					placeholder="--Select Default Warehouse--"
					readOnly={isReadonly}
					value={values.defaultWarehouse}
					onChange={(value) => onFieldChange("defaultWarehouse", String(value))}
				/>
				{warehouseItemsHref ? (
					<Link
						href={warehouseItemsHref}
						className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-skyblue transition hover:text-darknavy"
					>
						View warehouse items
						<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
					</Link>
				) : null}
			</FormField>
			<FormField label="Default Location" error={errors.defaultLocation}>
				<input
					name="defaultLocation"
					value={values.defaultLocation}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="WH-A-Z1-R01-S02-B03"
				/>
			</FormField>
			<FormField label="Zone" error={errors.defaultZone}>
				<input
					name="defaultZone"
					value={values.defaultZone}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Zone A"
				/>
			</FormField>
			<FormField label="Rack" error={errors.defaultRack}>
				<input
					name="defaultRack"
					value={values.defaultRack}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="R01"
				/>
			</FormField>
			<FormField label="Shelf" error={errors.defaultShelf}>
				<input
					name="defaultShelf"
					value={values.defaultShelf}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="S02"
				/>
			</FormField>
			<FormField label="Bin" error={errors.defaultBin}>
				<input
					name="defaultBin"
					value={values.defaultBin}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="B03"
				/>
			</FormField>
			<FormField label="Lot No." error={errors.defaultLotNo}>
				<input
					name="defaultLotNo"
					value={values.defaultLotNo}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="LOT-2026-001"
				/>
			</FormField>
			<FormField label="Lead Time" error={errors.leadTime}>
				<input
					name="leadTime"
					value={values.leadTime}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="3 days"
				/>
			</FormField>
			<FormField label="Reorder Level" error={errors.reorderLevel}>
				<DecimalNumberInput
					name="reorderLevel"
					value={values.reorderLevel}
					readOnly={isReadonly}
					onValueChange={(value) => onFieldChange("reorderLevel", value)}
				/>
			</FormField>
			<FormField label="Minimum Stock" error={errors.minimumStock}>
				<DecimalNumberInput
					name="minimumStock"
					value={values.minimumStock}
					readOnly={isReadonly}
					onValueChange={(value) => onFieldChange("minimumStock", value)}
				/>
			</FormField>
			<FormField label="Maximum Stock" error={errors.maximumStock}>
				<DecimalNumberInput
					name="maximumStock"
					value={values.maximumStock}
					readOnly={isReadonly}
					onValueChange={(value) => onFieldChange("maximumStock", value)}
				/>
			</FormField>
		</FieldPanel>
	);
}

function createSuggestedSellingPrice(values: ItemFormValues) {
	if (values.taxTreatment !== "VAT Exclusive") {
		return values.costPrice;
	}

	return values.costPrice * VatExclusiveTaxMultiplier;
}

function DecimalNumberInput({
	name,
	readOnly,
	value,
	onValueChange,
}: {
	name: keyof ItemFormValues;
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
			name={name}
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

function FieldPanel({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<div className="mt-4 grid gap-4 lg:grid-cols-2">{children}</div>
		</section>
	);
}

function FormField({
	children,
	error,
	label,
	required,
	wide,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "lg:col-span-2" : undefined}>
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
		</div>
	);
}

const ItemBehaviorGuide = [
	{
		title: "Sellable Item",
		description: "An item you can sell to customers.",
	},
	{
		title: "Purchasable Item",
		description: "An item you can buy from suppliers.",
	},
	{
		title: "Raw Material",
		description: "A material used to make another product.",
	},
	{
		title: "Semi-Finished Goods / WIP",
		description: "A partly finished product still used in production.",
	},
	{
		title: "Finished Goods",
		description: "A completed product ready to sell.",
	},
	{
		title: "Service Item",
		description: "A service with no stock quantity to track.",
	},
	{
		title: "Non-Inventory Item",
		description: "A bought or sold item where stock quantity is not tracked.",
	},
	{
		title: "Fixed Asset Item",
		description: "A long-term company asset, not for regular sale.",
	},
	{
		title: "Consumable Item",
		description: "An internal-use item that gets used up.",
	},
] as const satisfies ReadonlyArray<{
	description: string;
	title: ItemBehavior;
}>;

const ItemBehaviorFlagMap = {
	"Sellable Item": {
		asset: false,
		purchasable: false,
		sellable: true,
		service: false,
		trackInventory: false,
	},
	"Purchasable Item": {
		asset: false,
		purchasable: true,
		sellable: false,
		service: false,
		trackInventory: false,
	},
	"Raw Material": {
		asset: false,
		purchasable: true,
		sellable: false,
		service: false,
		trackInventory: true,
	},
	"Semi-Finished Goods / WIP": {
		asset: false,
		purchasable: false,
		sellable: false,
		service: false,
		trackInventory: true,
	},
	"Finished Goods": {
		asset: false,
		purchasable: false,
		sellable: true,
		service: false,
		trackInventory: true,
	},
	"Service Item": {
		asset: false,
		purchasable: false,
		sellable: true,
		service: true,
		trackInventory: false,
	},
	"Non-Inventory Item": {
		asset: false,
		purchasable: true,
		sellable: true,
		service: false,
		trackInventory: false,
	},
	"Fixed Asset Item": {
		asset: true,
		purchasable: true,
		sellable: false,
		service: false,
		trackInventory: false,
	},
	"Consumable Item": {
		asset: false,
		purchasable: true,
		sellable: false,
		service: false,
		trackInventory: true,
	},
} as const satisfies Record<
	ItemBehavior,
	Pick<
		ItemFormValues,
		"asset" | "purchasable" | "sellable" | "service" | "trackInventory"
	>
>;

const ItemStatusRadioOptions = [
	{ label: "Active", value: "Active" },
	{ label: "Inactive", value: "Inactive" },
] as const;

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

