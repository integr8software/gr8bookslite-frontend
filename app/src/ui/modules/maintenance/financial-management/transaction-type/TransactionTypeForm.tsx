import type { ChangeEventHandler, ReactNode } from "react";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import type { FormSignatoryModuleOption } from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type TransactionTypeFormProps = {
	accountOptions: ChartAccount[];
	errors: TransactionTypeFormErrors;
	isReadonly: boolean;
	moduleOptions: FormSignatoryModuleOption[];
	values: TransactionTypeFormValues;
	onAccountChange: (accountId: string) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onModuleChange: (value: string | string[]) => void;
};

export function TransactionTypeForm({
	accountOptions,
	errors,
	isReadonly,
	moduleOptions,
	values,
	onAccountChange,
	onInputChange,
	onModuleChange,
}: TransactionTypeFormProps) {
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
						placeholder="Enter transaction type name"
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
						{TransactionTypeStatusOptions.map((statusOption) => (
							<option key={statusOption} value={statusOption}>
								{statusOption}
							</option>
						))}
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
						placeholder="Enter description"
					/>
				</FormField>

				<FormField label="Module" error={errors.moduleId} required>
					<AppAdvancedDropdown
						options={moduleDropdownOptions}
						placeholder="Select available module"
						readOnly={isReadonly}
						searchPlaceholder="Search module"
						value={values.moduleId}
						onChange={onModuleChange}
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
			</div>
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

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

const selectClassName = `app-select-control ${fieldClassName}`;
