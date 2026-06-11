import type { ChangeEvent, ReactNode } from "react";
import {
	ResponsibilityCenterCategoryOptions,
	ResponsibilityCenterFinancialTypeOptions,
	ResponsibilityCenterStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormErrors,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ResponsibilityCenterFormField as Field,
	responsibilityCenterFieldClassName as fieldClassName,
} from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterFormField";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ResponsibilityCenterDetailsFieldsProps = {
	errors: ResponsibilityCenterFormErrors;
	isReadonly: boolean;
	parentOptions: ResponsibilityCenter[];
	values: ResponsibilityCenterFormValues;
	onInputChange: (
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void;
	onFieldChange: (
		field: keyof ResponsibilityCenterFormValues,
		value: ResponsibilityCenterFormValues[keyof ResponsibilityCenterFormValues],
	) => void;
};

export function ResponsibilityCenterDetailsFields({
	errors,
	isReadonly,
	onFieldChange,
	onInputChange,
	parentOptions,
	values,
}: ResponsibilityCenterDetailsFieldsProps) {
	const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map(
		(center) => ({
			description: center.financialType,
			name: center.name,
			value: center.id,
		}),
	);

	return (
		<div className="grid gap-4">
			<FormSection title="Basic Information">
				<div className="grid gap-4 lg:grid-cols-2">
					<Field
						label="Name"
						error={errors.name}
						required
						className="lg:col-span-2"
					>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Administration"
						/>
					</Field>

					<Field label="Category" error={errors.category} required>
						<select
							name="category"
							value={values.category}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ResponsibilityCenterCategoryOptions.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</Field>

					<Field label="Type" error={errors.financialType} required>
						<select
							name="financialType"
							value={values.financialType}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
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

					<Field label="Manager" error={errors.manager} required>
						<input
							name="manager"
							value={values.manager}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Maria Santos"
						/>
					</Field>

					<Field label="Status" required>
						<select
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ResponsibilityCenterStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</Field>
				</div>
			</FormSection>

			<FormSection title="Reporting Config">
				<div className="grid gap-3 sm:grid-cols-2">
					<CheckboxField
						name="allowBudgetAllocation"
						label="Allow Budget Allocation"
						checked={values.allowBudgetAllocation}
						disabled={isReadonly}
						onChange={onInputChange}
					/>
					<CheckboxField
						name="allowExpensePosting"
						label="Allow Expense Posting"
						checked={values.allowExpensePosting}
						disabled={isReadonly}
						onChange={onInputChange}
					/>
					<CheckboxField
						name="allowRevenuePosting"
						label="Allow Revenue Posting"
						checked={values.allowRevenuePosting}
						disabled={isReadonly}
						onChange={onInputChange}
					/>
					<CheckboxField
						name="allowProjectAssignment"
						label="Allow Project Assignment"
						checked={values.allowProjectAssignment}
						disabled={isReadonly}
						onChange={onInputChange}
					/>
				</div>
			</FormSection>
		</div>
	);
}

function FormSection({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<h3 className="mb-4 text-sm font-semibold text-darknavy">{title}</h3>
			{children}
		</section>
	);
}

function CheckboxField({
	checked,
	disabled,
	label,
	name,
	onChange,
}: {
	checked: boolean;
	disabled: boolean;
	label: string;
	name: keyof Pick<
		ResponsibilityCenterFormValues,
		| "allowBudgetAllocation"
		| "allowExpensePosting"
		| "allowRevenuePosting"
		| "allowProjectAssignment"
	>;
	onChange: ResponsibilityCenterDetailsFieldsProps["onInputChange"];
}) {
	return (
		<label className="flex items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5">
			<input
				type="checkbox"
				name={name}
				checked={checked}
				disabled={disabled}
				onChange={onChange}
				className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
			/>
			{label}
		</label>
	);
}
