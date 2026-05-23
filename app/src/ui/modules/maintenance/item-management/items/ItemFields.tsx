import type { ChangeEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type {
	ItemFormErrors,
	ItemFormValues,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ItemTagsInput } from "./ItemTagsInput";

type ItemFieldsProps = {
	categoryOptions: AppAdvancedDropdownOption[];
	errors: ItemFormErrors;
	isReadonly: boolean;
	statusOptions: AppAdvancedDropdownOption[];
	subcategoryOptions: AppAdvancedDropdownOption[];
	subtypeOptions: AppAdvancedDropdownOption[];
	typeOptions: AppAdvancedDropdownOption[];
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

export function ItemFields({
	categoryOptions,
	errors,
	isReadonly,
	onAddTag,
	onFieldChange,
	onInputChange,
	onRemoveTag,
	statusOptions,
	subcategoryOptions,
	subtypeOptions,
	typeOptions,
	uomOptions,
	values,
	warehouseItemsHref,
	warehouseOptions,
}: ItemFieldsProps) {
	const suggestedSellingPrice = createSuggestedSellingPrice(values);

	return (
		<div className="grid gap-5">
			<FieldPanel title="Item Information">
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
				<FormField label="Third Party Code" error={errors.thirdPartyCode}>
					<input
						name="thirdPartyCode"
						value={values.thirdPartyCode}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Supplier or external code"
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
				<FormField label="Description" error={errors.description} wide>
					<textarea
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={`${fieldClassName} min-h-24 py-3`}
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

			<FieldPanel title="Classification">
				<FormField label="Category" error={errors.category} required>
					<AppAdvancedDropdown
						options={categoryOptions}
						placeholder="Select category"
						readOnly={isReadonly}
						showSelectedDetails
						value={values.category}
						onChange={(value) => onFieldChange("category", String(value))}
					/>
				</FormField>
				<FormField label="Sub Category" error={errors.subcategory} required>
					<AppAdvancedDropdown
						options={subcategoryOptions}
						placeholder="Select sub category"
						readOnly={isReadonly}
						showSelectedDetails
						value={values.subcategory}
						onChange={(value) => onFieldChange("subcategory", String(value))}
					/>
				</FormField>
				<FormField label="Item Type" error={errors.type} required>
					<AppAdvancedDropdown
						options={typeOptions}
						placeholder="Select item type"
						readOnly={isReadonly}
						showSelectedDetails
						value={values.type}
						onChange={(value) => onFieldChange("type", String(value))}
					/>
				</FormField>
				<FormField label="Sub Item Type" error={errors.subtype} required>
					<AppAdvancedDropdown
						options={subtypeOptions}
						placeholder="Select sub item type"
						readOnly={isReadonly}
						showSelectedDetails
						value={values.subtype}
						onChange={(value) => onFieldChange("subtype", String(value))}
					/>
				</FormField>
				<FormField label="Item UOM" error={errors.uom} required>
					<AppAdvancedDropdown
						options={uomOptions}
						readOnly={isReadonly}
						showSelectedDetails
						value={values.uom}
						onChange={(value) => onFieldChange("uom", String(value))}
					/>
				</FormField>
				<FormField label="Default Warehouse" error={errors.defaultWarehouse}>
					<AppAdvancedDropdown
						isClearable
						options={warehouseOptions}
						placeholder="Select default warehouse"
						readOnly={isReadonly}
						value={values.defaultWarehouse}
						onChange={(value) =>
							onFieldChange("defaultWarehouse", String(value))
						}
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
				<ToggleField
					checked={values.supportsBundle}
					isReadonly={isReadonly}
					label="Bundle Components"
					name="supportsBundle"
					onChange={onInputChange}
				/>
				<FormField label="Status" error={errors.status} required>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{statusOptions.map((status) => (
							<option key={status.value} value={status.value}>
								{status.name}
							</option>
						))}
					</select>
				</FormField>
			</FieldPanel>

			<FieldPanel title="Pricing & Cost">
				<FormField label="Cost" error={errors.costPrice}>
					<input
						name="costPrice"
						type="number"
						min={0}
						step="0.01"
						value={values.costPrice}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
					/>
				</FormField>
				<FormField label="Suggested Price">
					<div className="flex min-h-11 items-center rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy">
						{formatCurrency(suggestedSellingPrice)}
					</div>
				</FormField>
				<ToggleField
					checked={values.isVatable}
					isReadonly={isReadonly}
					label="VATable"
					name="isVatable"
					onChange={onInputChange}
				/>
				<ToggleField
					checked={values.isVatIncluded}
					isReadonly={isReadonly}
					label="VAT Included"
					name="isVatIncluded"
					onChange={onInputChange}
				/>
				<FormField label="Selling Price" error={errors.sellingPrice}>
					<input
						name="sellingPrice"
						type="number"
						min={0}
						step="0.01"
						value={values.sellingPrice}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
					/>
				</FormField>
			</FieldPanel>
		</div>
	);
}

function createSuggestedSellingPrice(values: ItemFormValues) {
	if (!values.isVatable && !values.isVatIncluded) {
		return values.costPrice;
	}

	return values.costPrice * 1.12;
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-US", {
		currency: "PHP",
		style: "currency",
	}).format(value);
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

function ToggleField({
	checked,
	isReadonly,
	label,
	name,
	onChange,
}: {
	checked: boolean;
	isReadonly: boolean;
	label: string;
	name: keyof ItemFormValues;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy">
			<input
				name={name}
				type="checkbox"
				checked={checked}
				onChange={onChange}
				disabled={isReadonly}
				className="h-4 w-4 accent-skyblue disabled:cursor-default"
			/>
			{label}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
