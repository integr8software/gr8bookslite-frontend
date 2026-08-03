import * as React from "react";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import {
	TransactionTypeModuleDescriptions,
	TransactionTypeNamePlaceholder,
} from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type { ModuleOption } from "@/app/src/data/shared/modules/ModuleOptionsData";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppRadioGroup } from "@/app/src/ui/shared/app/AppRadioGroup";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

type TransactionTypeFormProps = {
	accountOptions: ModuleChartAccount[];
	errors: TransactionTypeFormErrors;
	isReadonly: boolean;
	moduleOptions: ModuleOption[];
	values: TransactionTypeFormValues;
	onAccountChange: (accountId: string) => void;
	onInputChange: React.ChangeEventHandler<
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
	const moduleRadioOptions = moduleOptions.map((option) => ({
		description:
			TransactionTypeModuleDescriptions[
				option.value as keyof typeof TransactionTypeModuleDescriptions
			],
		label: option.label,
		value: option.value,
	}));

	return (
		<div className="grid gap-4">
			<FormField label="Inventory Transaction Type Name" error={errors.name} required>
				<input
					name="name"
					value={values.name}
					onChange={onInputChange}
					readOnly={isReadonly}
					className={fieldClassName}
					placeholder={TransactionTypeNamePlaceholder}
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
					placeholder="Enter description..."
				/>
			</FormField>

			<FormField
				asFieldset
				label="Goods Movement"
				error={errors.moduleIds}
				required
			>
				<AppRadioGroup
					aria-label="Goods Movement"
					name="moduleIds"
					options={moduleRadioOptions}
					readOnly={isReadonly}
					value={values.moduleIds[0] ?? ""}
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
	asFieldset,
	children,
	className,
	error,
	label,
	required,
}: {
	asFieldset?: boolean;
	children: React.ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	if (asFieldset) {
		return (
			<fieldset className={className}>
				<legend className="mb-2 block text-sm font-semibold text-darknavy">
					{label}
					{required ? <span className="text-coralpink"> *</span> : null}
				</legend>
				{children}
				{error ? (
					<span className="mt-1 block text-xs font-medium text-coralpink">
						{error}
					</span>
				) : null}
			</fieldset>
		);
	}

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
