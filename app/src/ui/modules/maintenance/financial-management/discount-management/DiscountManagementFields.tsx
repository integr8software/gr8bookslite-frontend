import type { ChangeEventHandler, ReactNode } from "react";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import type { ModuleOption } from "@/app/src/data/shared/modules/ModuleOptionsData";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type DiscountManagementFieldsProps = {
	accountOptions: ModuleChartAccount[];
	errors: DiscountManagementFormErrors;
	isReadonly: boolean;
	moduleOptions: ModuleOption[];
	values: DiscountManagementFormValues;
	onAccountChange: (accountId: string) => void;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onModuleChange: (value: string | string[]) => void;
};

export function DiscountManagementFields({
	accountOptions,
	errors,
	isReadonly,
	moduleOptions,
	values,
	onAccountChange,
	onInputChange,
	onModuleChange,
}: DiscountManagementFieldsProps) {
	const moduleDropdownOptions = moduleOptions.map((option) => ({
		name: option.label,
		value: option.value,
	}));

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Name" error={errors.name} required>
					<input
						name="name"
						value={values.name}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter discount name"
					/>
				</FormField>

				<FormField label="Status" error={errors.status} required>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={selectClassName}
					>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
					</select>
				</FormField>

				<FormField
					label="Description"
					error={errors.description}
					required
					className="lg:col-span-2"
				>
					<input
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="What is this discount for?"
					/>
				</FormField>

				<FormField label="Discount Type" error={errors.discountType} required>
					<select
						name="discountType"
						value={values.discountType}
						onChange={onInputChange}
						disabled={isReadonly}
						className={selectClassName}
					>
						<option value="Percentage">Percentage</option>
						<option value="Fixed">Fixed</option>
					</select>
				</FormField>

				<FormField label="Discount Value" error={errors.amount} required>
					<input
						name="amount"
						type="number"
						min="0"
						max={values.discountType === "Percentage" ? "100" : undefined}
						step="any"
						value={values.amount}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder={
							values.discountType === "Percentage"
								? "Enter percentage"
								: "Enter fixed amount"
						}
					/>
				</FormField>

				<FormField label="Account Title" error={errors.accountId} required>
					<ChartAccountDropdown
						accounts={accountOptions}
						placeholder="Search account by name or code"
						readOnly={isReadonly}
						value={values.accountId}
						onChange={onAccountChange}
					/>
				</FormField>

				<FormField label="Module" error={errors.moduleIds} required>
					<AppAdvancedDropdown
						options={moduleDropdownOptions}
						placeholder="Select available module"
						readOnly={isReadonly}
						searchPlaceholder="Search module"
						selectionMode="multiple"
						value={values.moduleIds}
						onChange={onModuleChange}
					/>
				</FormField>
			</div>
		</div>
	);
}

function FormField({
	children,
	error,
	className,
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

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

const selectClassName = `app-select-control ${fieldClassName}`;
