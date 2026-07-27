import type { ChangeEventHandler } from "react";
import {
	InventoryCountCategoryOptions,
	inventoryCountFieldClassName,
	InventoryCountItemGroupOptions,
	InventoryCountItemTypeOptions,
	InventoryCountStatusOptions,
	InventoryCountWarehouseOptions,
} from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import type { InventoryCountValues } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

type InventoryCountHeaderFieldsProps = {
	isReadonly: boolean;
	onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
	values: InventoryCountValues;
};

export function InventoryCountHeaderFields({
	isReadonly,
	onChange,
	values,
}: InventoryCountHeaderFieldsProps) {
	return (
		<section className="w-full rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
			<div className="grid w-full items-start gap-4 xl:grid-cols-[1fr_0.85fr_1fr]">
				<div className="grid gap-2">
					<RequiredSelectRow
						label="Warehouse"
						name="warehouse"
						disabled={isReadonly}
						value={values.warehouse}
						options={InventoryCountWarehouseOptions}
						onChange={onChange}
					/>
					<RequiredSelectRow
						label="Item Type"
						name="itemType"
						disabled={isReadonly}
						value={values.itemType}
						options={InventoryCountItemTypeOptions}
						onChange={onChange}
					/>
					<RequiredSelectRow
						label="Item Category"
						name="category"
						disabled={isReadonly}
						value={values.category}
						options={InventoryCountCategoryOptions}
						onChange={onChange}
					/>
					<RequiredSelectRow
						label="Item Group"
						name="itemGroup"
						disabled={isReadonly}
						value={values.itemGroup}
						options={InventoryCountItemGroupOptions}
						onChange={onChange}
					/>
				</div>

				<div className="grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] xl:pt-0">
					<label
						htmlFor="inventory-count-remarks"
						className="pt-8 text-sm font-semibold text-darknavy"
					>
						Remarks:
					</label>
					<textarea
						id="inventory-count-remarks"
						name="remarks"
						readOnly={isReadonly}
						value={values.remarks}
						onChange={onChange}
						className={`${inventoryCountFieldClassName} min-h-20 resize-y`}
					/>
				</div>

				<div className="grid gap-2">
					<CompactTextRow
						label="Inventory Count No."
						name="countNo"
						readOnly={isReadonly}
						required
						value={values.countNo}
						onChange={onChange}
					/>
					<CompactTextRow
						label="Inventory Count Date"
						name="countDate"
						readOnly={isReadonly}
						type="date"
						value={values.countDate}
						onChange={onChange}
					/>
					<CompactSelectRow
						label="Status"
						name="status"
						disabled={isReadonly}
						value={values.status}
						options={InventoryCountStatusOptions}
						onChange={onChange}
					/>
				</div>
			</div>

			<div className="mt-4 grid w-full gap-4 border-t border-darknavy/10 pt-4 md:grid-cols-2">
				<TextField
					label="Uploader"
					name="uploader"
					readOnly={isReadonly}
					value={values.uploader}
					onChange={onChange}
				/>
				<TextField
					label="Counter"
					name="counter"
					readOnly={isReadonly}
					value={values.counter}
					onChange={onChange}
				/>
			</div>
		</section>
	);
}

function RequiredSelectRow({
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
		<div className="grid items-center gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
			<label
				htmlFor={`inventory-count-${name}`}
				className="whitespace-nowrap text-sm font-medium text-darknavy"
			>
				{label}: <span className="text-red-500">*</span>
			</label>
			<select
				id={`inventory-count-${name}`}
				name={name}
				disabled={disabled}
				value={value}
				onChange={onChange}
				className={`${inventoryCountFieldClassName} min-h-7 py-0 text-xs`}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
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
				className={inventoryCountFieldClassName}
			/>
		</label>
	);
}

function CompactTextRow({
	label,
	name,
	onChange,
	readOnly,
	required = false,
	type = "text",
	value,
}: {
	label: string;
	name: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
	readOnly: boolean;
	required?: boolean;
	type?: "date" | "text";
	value: string;
}) {
	return (
		<div className="grid items-center gap-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
			<label
				htmlFor={`inventory-count-${name}`}
				className="whitespace-nowrap text-sm font-medium text-darknavy"
			>
				{label}: {required ? <span className="text-red-500">*</span> : null}
			</label>
			<input
				id={`inventory-count-${name}`}
				name={name}
				readOnly={readOnly}
				type={type}
				value={value}
				onChange={onChange}
				className={`${inventoryCountFieldClassName} min-h-7 py-0 text-xs`}
			/>
		</div>
	);
}

function CompactSelectRow({
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
		<div className="grid items-center gap-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
			<label
				htmlFor={`inventory-count-${name}`}
				className="whitespace-nowrap text-sm font-medium text-darknavy"
			>
				{label}:
			</label>
			<select
				id={`inventory-count-${name}`}
				name={name}
				disabled={disabled}
				value={value}
				onChange={onChange}
				className={`${inventoryCountFieldClassName} min-h-7 py-0 text-xs`}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
