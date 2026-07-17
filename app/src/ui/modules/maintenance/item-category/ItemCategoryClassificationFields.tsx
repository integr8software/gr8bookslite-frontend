import type { ChangeEventHandler, ReactNode } from "react";
import { Info } from "lucide-react";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
	ItemCategorySystemDefaultAccountingSetup,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
import type {
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryClassificationFormErrors,
	ItemCategoryClassificationFormValues,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";

type ItemCategoryParentOption = {
	id: string;
	kindLabel: string;
	label: string;
	pathName: string;
};

type ItemCategoryClassificationFieldsProps = {
	errors: ItemCategoryClassificationFormErrors;
	isReadonly: boolean;
	parentOptions: ItemCategoryParentOption[];
	values: ItemCategoryClassificationFormValues;
	onAccountingFieldChange: (
		field: keyof ItemCategoryAccountingSetup,
		value: string,
	) => void;
	onAccountingModeChange: (mode: ItemCategoryAccountingSetupMode) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onParentChange: (parentId: string) => void;
};

const AccountingFields: Array<{
	key: keyof ItemCategoryAccountingSetup;
	label: string;
}> = [
		{ key: "inventoryAccount", label: "Inventory Account" },
		{ key: "salesAccount", label: "Sales Account" },
		{ key: "costOfSalesAccount", label: "Cost of Sales Account" },
		{ key: "discountAccount", label: "Discount Account" },
		{ key: "purchaseAccount", label: "Purchase Account" },
		{ key: "expenseAccount", label: "Expense Account" },
	];

export function ItemCategoryClassificationFields({
	errors,
	isReadonly,
	onAccountingFieldChange,
	onAccountingModeChange,
	onInputChange,
	onParentChange,
	parentOptions,
	values,
}: ItemCategoryClassificationFieldsProps) {
	const isAccountingReadonly = isReadonly || values.accountingSetupMode !== "own";
	const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map(
		(option) => ({
			label: option.pathName,
			name: option.label,
			value: option.id,
		}),
	);

	return (
		<div className="grid gap-4">
			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-2">
					<FormField label="Category Name" error={errors.name} required>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Category name"
						/>
					</FormField>
					<FormField label="Parent Category" error={errors.parentId}>
						<AppAdvancedDropdown
							options={parentDropdownOptions}
							placeholder=""
							readOnly={isReadonly}
							searchPlaceholder="Search parent category"
							showSelectionIndicator={false}
							showSelectedDetails
							value={values.parentId}
							onChange={(value) => onParentChange(String(value))}
						/>
					</FormField>
					<FormField label="Allow Sub Category">
						<span className="flex min-h-11 items-center gap-3 rounded-md border border-darknavy/15 bg-white px-3 text-sm font-semibold text-darknavy">
							<input
								type="checkbox"
								name="allowSubCategory"
								checked={values.allowSubCategory}
								onChange={onInputChange}
								disabled={isReadonly}
								className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/25"
							/>
							Enabled
						</span>
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
					<FormField label="Description" error={errors.description}>
						<AppLimitedTextarea
							name="description"
							value={values.description}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={`${fieldClassName} min-h-24 py-3`}
							placeholder="Description"
						/>
					</FormField>
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="flex flex-col gap-3 border-b border-darknavy/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h3 className="text-base font-semibold text-darknavy">
							Accounting Setup
						</h3>
						<p className="mt-1 max-w-2xl text-sm leading-6 text-darknavy/60">
							Inherit uses the nearest parent setup or system defaults. Not Set
							leaves the category without accounting setup.
						</p>
					</div>
					<div
						role="radiogroup"
						aria-label="Accounting setup mode"
						className="grid shrink-0 gap-2 sm:grid-cols-3"
					>
						<AccountingModeOption
							checked={values.accountingSetupMode === "inherit"}
							disabled={isReadonly}
							label="Inherit"
							onChange={() => onAccountingModeChange("inherit")}
						/>
						<AccountingModeOption
							checked={values.accountingSetupMode === "notSet"}
							disabled={isReadonly}
							label="Not Set"
							onChange={() => onAccountingModeChange("notSet")}
						/>
						<AccountingModeOption
							checked={values.accountingSetupMode === "own"}
							disabled={isReadonly}
							label="Own Setup"
							onChange={() => onAccountingModeChange("own")}
						/>
					</div>
				</div>

				{values.accountingSetupMode === "inherit" ? (
					<div className="mt-4 flex gap-3 rounded-lg border border-skyblue/20 bg-skyblue/10 p-3 text-sm leading-6 text-darknavy/70">
						<Info className="mt-0.5 h-4 w-4 shrink-0 text-skyblue" aria-hidden="true" />
						<span>
							Accounting fields are disabled. This category uses the nearest
							parent setup, or system defaults when no parent setup exists. The
							system default inventory account is{" "}
							<strong>{ItemCategorySystemDefaultAccountingSetup.inventoryAccount}</strong>
							.
						</span>
					</div>
				) : null}
				{values.accountingSetupMode === "notSet" ? (
					<div className="mt-4 flex gap-3 rounded-lg border border-darknavy/10 bg-offwhite/70 p-3 text-sm leading-6 text-darknavy/70">
						<Info className="mt-0.5 h-4 w-4 shrink-0 text-darknavy/45" aria-hidden="true" />
						<span>
							Accounting fields are disabled. This category has no accounting
							setup and will not inherit a parent setup.
						</span>
					</div>
				) : null}

				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					{AccountingFields.map((field) => (
						<FormField
							key={field.key}
							label={field.label}
							error={errors[field.key]}
							required={values.accountingSetupMode === "own"}
						>
							<ChartAccountDropdown
								accounts={getModuleChartAccounts({
									moduleKey: "maintenance-item-category",
									purpose: field.key,
								})}
								disabled={isAccountingReadonly}
								placeholder=""
								searchPlaceholder="Search account title"
								showSelectionIndicator={false}
								valueField="accountName"
								value={values.accountingSetup[field.key]}
								onChange={(value) => onAccountingFieldChange(field.key, value)}
							/>
						</FormField>
					))}
				</div>
			</section>
		</div>
	);
}

function AccountingModeOption({
	checked,
	disabled,
	label,
	onChange,
}: {
	checked: boolean;
	disabled: boolean;
	label: string;
	onChange: () => void;
}) {
	return (
		<label
			className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${checked
				? "border-skyblue bg-skyblue/10 text-darknavy"
				: "border-darknavy/10 bg-white text-darknavy/70"
				} ${disabled ? "cursor-default opacity-70" : "cursor-pointer"}`}
		>
			<input
				type="radio"
				name="accountingSetupMode"
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				className="h-4 w-4 border-darknavy/20 text-skyblue focus:ring-skyblue/25"
			/>
			{label}
		</label>
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
		<label className="block">
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
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
