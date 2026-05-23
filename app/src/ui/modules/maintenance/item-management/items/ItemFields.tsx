import type { ChangeEventHandler, ReactNode } from "react";
import {
	ItemStatusOptions,
	ItemTrackingTypeOptions,
	ItemUomOptions,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemFormErrors,
	ItemFormValues,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemFieldsProps = {
	errors: ItemFormErrors;
	isReadonly: boolean;
	values: ItemFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function ItemFields({
	errors,
	isReadonly,
	onInputChange,
	values,
}: ItemFieldsProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Item Code" error={errors.code} required>
					<input
						name="code"
						value={values.code}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="ITM-0001"
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
				<FormField label="Category" error={errors.category} required>
					<input
						name="category"
						value={values.category}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Category"
					/>
				</FormField>
				<FormField label="Sub Category" error={errors.subcategory} required>
					<input
						name="subcategory"
						value={values.subcategory}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Sub category"
					/>
				</FormField>
				<FormField label="Item Type" error={errors.type} required>
					<input
						name="type"
						value={values.type}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Item type"
					/>
				</FormField>
				<FormField label="Sub Item Type" error={errors.subtype} required>
					<input
						name="subtype"
						value={values.subtype}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Sub item type"
					/>
				</FormField>
				<FormField label="Tracking Type" error={errors.trackingType} required>
					<select
						name="trackingType"
						value={values.trackingType}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ItemTrackingTypeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</FormField>
				<FormField label="UOM" error={errors.uom} required>
					<select
						name="uom"
						value={values.uom}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ItemUomOptions.map((uom) => (
							<option key={uom} value={uom}>
								{uom}
							</option>
						))}
					</select>
				</FormField>
				<FormField label="Status" error={errors.status} required>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ItemStatusOptions.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</FormField>
				<label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy">
					<input
						name="supportsBundle"
						type="checkbox"
						checked={values.supportsBundle}
						onChange={onInputChange}
						disabled={isReadonly}
						className="h-4 w-4 accent-skyblue"
					/>
					Supports bundle components
				</label>
				<FormField label="Description" error={errors.description}>
					<textarea
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={`${fieldClassName} min-h-24 py-3`}
						placeholder="Item notes"
					/>
				</FormField>
			</div>
		</div>
	);
}

function FormField({
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

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

