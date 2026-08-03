import type { ChangeEventHandler, ReactNode } from "react";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import type { ModuleOption } from "@/app/src/data/shared/modules/ModuleOptionsData";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

type TransactionTypeFormProps = {
	accountOptions: ModuleChartAccount[];
	errors: TransactionTypeFormErrors;
	isReadonly: boolean;
	moduleOptions: ModuleOption[];
	values: TransactionTypeFormValues;
	onAccountChange: (accountId: string) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onModuleChange: (value: string | string[]) => void;
	onStatusChange: (value: TransactionTypeFormValues["status"]) => void;
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
	onStatusChange,
}: TransactionTypeFormProps) {
	const moduleDropdownOptions = moduleOptions.map((option) => ({
		name: option.label,
		value: option.value,
	}));

	return (
		<div className="grid gap-4">
			<FormField label="Name" error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder="Enter inventory transaction type name"
				/>
			</FormField>

			<FormField label="Description" error={errors.description}>
				<AppLimitedTextarea
					name="description"
					value={values.description}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={`${fieldClassName} min-h-24 py-3`}
					counterMode="used"
					placeholder="Enter description"
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

			<FormField label="Goods Movement Module" error={errors.moduleIds} required>
				<AppAdvancedDropdown
					options={moduleDropdownOptions}
					placeholder="--Select Goods Movement Module--"
					readOnly={isReadonly}
					searchPlaceholder="Search goods movement module"
					selectionMode="multiple"
					value={values.moduleIds}
					onChange={onModuleChange}
				/>
			</FormField>

			<FormField label="Status" error={errors.status} required>
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

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
