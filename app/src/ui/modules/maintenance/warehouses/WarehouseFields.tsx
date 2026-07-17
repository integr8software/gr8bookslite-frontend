import type { ChangeEventHandler, ReactNode } from "react";
import {
	WarehouseStatusOptions,
} from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type {
	WarehouseFormErrors,
	WarehouseFormValues,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type WarehouseFieldsProps = {
	errors: WarehouseFormErrors;
	values: WarehouseFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function WarehouseFields({
	errors,
	onInputChange,
	values,
}: WarehouseFieldsProps) {
	return (
		<div className="grid gap-4">
			<FormField label="Warehouse Name" error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					className={fieldClassName}
					placeholder="Main Warehouse"
				/>
			</FormField>
			<FormField label="Description" error={errors.description}>
				<AppLimitedTextarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					className={`${fieldClassName} min-h-24 py-3`}
					placeholder="Usage notes for this warehouse"
					counterMode="used"
				/>
			</FormField>
			<FormField label="Address" error={errors.address} required>
				<textarea
					name="address"
					value={values.address}
					onChange={onInputChange}
					className={`${fieldClassName} min-h-24 py-3`}
					placeholder="Warehouse address"
				/>
			</FormField>
			<FormField label="Manager" error={errors.managerName} required>
				<input
					name="managerName"
					value={values.managerName}
					onChange={onInputChange}
					className={fieldClassName}
					placeholder="Warehouse manager"
				/>
			</FormField>
			<FormField label="Contact No." error={errors.contactNo} required>
				<input
					name="contactNo"
					value={values.contactNo}
					onChange={onInputChange}
					className={fieldClassName}
					placeholder="+63 2 8123 4567"
				/>
			</FormField>
			<FormField label="Warehouse Code" error={errors.code} required>
				<input
					name="code"
					value={values.code}
					onChange={onInputChange}
					className={fieldClassName}
					placeholder="WH-MAIN"
				/>
			</FormField>
			<FormField label="Active" error={errors.status} required>
				<select
					name="status"
					value={values.status}
					onChange={onInputChange}
					className={fieldClassName}
				>
					{WarehouseStatusOptions.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
			</FormField>
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
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20";
