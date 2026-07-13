import {
	ResponsibilityCenterCategoryOptions,
	ResponsibilityCenterFieldClassName,
	ResponsibilityCenterFinancialTypeOptions,
	ResponsibilityCenterStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenterFieldsProps } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterFormField as Field } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterFormField";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function ResponsibilityCenterDetailsFields({
	errors,
	isReadonly,
	onFieldChange,
	onInputChange,
	parentOptions,
	values,
}: ResponsibilityCenterFieldsProps) {
	const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map(
		(center) => ({
			description: center.financialType,
			name: center.name,
			value: center.id,
		}),
	);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Field
				label="Code"
				error={errors.code}
				required
			>
				<input
					name="code"
					value={values.code}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={ResponsibilityCenterFieldClassName}
					placeholder="SALES"
				/>
			</Field>

			<Field
				label="Name"
				error={errors.name}
				required
			>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={ResponsibilityCenterFieldClassName}
					placeholder="Sales Department"
				/>
			</Field>

			<Field label="Type" error={errors.category} required>
				<select
					name="category"
					value={values.category}
					onChange={onInputChange}
					disabled={isReadonly}
					className={ResponsibilityCenterFieldClassName}
				>
					{ResponsibilityCenterCategoryOptions.map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</Field>

			<Field label="Classification" error={errors.financialType} required>
				<select
					name="financialType"
					value={values.financialType}
					onChange={onInputChange}
					disabled={isReadonly}
					className={ResponsibilityCenterFieldClassName}
				>
					{ResponsibilityCenterFinancialTypeOptions.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</Field>

			<Field
				label="Parent Center"
				error={errors.parentId}
				className="lg:col-span-2"
			>
				<AppAdvancedDropdown
					options={parentDropdownOptions}
					placeholder="No parent center"
					readOnly={isReadonly}
					searchPlaceholder="Search parent center"
					showSelectionIndicator={false}
					showSelectedDetails
					value={values.parentId}
					onChange={(value) => onFieldChange("parentId", String(value))}
				/>
			</Field>

			<Field label="Manager" error={errors.manager}>
				<input
					name="manager"
					value={values.manager}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={ResponsibilityCenterFieldClassName}
					placeholder="Maria Santos"
				/>
			</Field>

			<Field label="Status" required>
				<select
					name="status"
					value={values.status}
					onChange={onInputChange}
					disabled={isReadonly}
					className={ResponsibilityCenterFieldClassName}
				>
					{ResponsibilityCenterStatusOptions.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
			</Field>

			<Field
				label="Description"
				error={errors.description}
				className="lg:col-span-2"
			>
				<textarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={`${ResponsibilityCenterFieldClassName} min-h-24 resize-y py-3`}
					placeholder="How this center is used in transactions and reports"
				/>
			</Field>
		</div>
	);
}
