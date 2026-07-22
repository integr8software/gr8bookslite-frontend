import type { ReactNode } from "react";
import {
	UnitOfMeasurementFieldClassName,
	UnitOfMeasurementQuantityModeOptions,
	UnitOfMeasurementSelectClassName,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import type {
	UnitOfMeasurementFieldsProps,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/constants/modules/maintenance/MaintenanceStatusConstants";

export function UnitOfMeasurementFields({
	errors,
	isReadonly,
	values,
	onInputChange,
	onStatusChange,
}: UnitOfMeasurementFieldsProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<FormField
				label="Unit of Measurement"
				error={errors.name}
				className="lg:col-span-2"
				required
			>
				<input
					name="name"
					value={values.name}
					readOnly={isReadonly}
					onChange={onInputChange}
					className={UnitOfMeasurementFieldClassName}
					placeholder="Box"
				/>
			</FormField>
			<FormField label="Symbol" error={errors.symbol} required>
				<input
					name="symbol"
					value={values.symbol}
					readOnly={isReadonly}
					onChange={onInputChange}
					className={UnitOfMeasurementFieldClassName}
					placeholder="BOX"
				/>
			</FormField>
			<FormField label="Quantity Type" error={errors.quantityMode} required>
				<select
					name="quantityMode"
					value={values.quantityMode}
					disabled={isReadonly}
					onChange={onInputChange}
					className={UnitOfMeasurementSelectClassName}
				>
					{UnitOfMeasurementQuantityModeOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</FormField>
			<FormField label="Status" error={errors.status} className="lg:col-span-2" required>
				<AppSwitch
					falseOption={MaintenanceInactiveStatusSwitchOption}
					value={values.status}
					onChange={onStatusChange}
					readOnly={isReadonly}
					trueOption={MaintenanceActiveStatusSwitchOption}
				/>
			</FormField>
		</div>
	);
}

function FormField({
	children,
	className,
	error,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
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
