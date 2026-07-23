import { useState, type ChangeEventHandler, type ReactNode } from "react";
import { Check, Info } from "lucide-react";
import type {
	ItemBehavior,
	ItemStatus,
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryFormErrors,
	ItemCategoryFormValues,
} from "@/app/src/types/modules/item-management/item-category/ItemCategoryTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";

type ItemCategoryParentOption = {
	accountingSetup?: ItemCategoryAccountingSetup;
	id: string;
	kindLabel: string;
	label: string;
	pathName: string;
};

type ItemCategoryFieldsProps = {
	errors: ItemCategoryFormErrors;
	isReadonly: boolean;
	parentOptions: ItemCategoryParentOption[];
	values: ItemCategoryFormValues;
	onAccountingModeChange: (mode: ItemCategoryAccountingSetupMode) => void;
	onAccountRequirementChange: (
		key: AccountingRequirementKey,
		required: boolean,
	) => void;
	onAllowSubCategoryChange: (allowSubCategory: boolean) => void;
	onBehaviorChange: (behavior: ItemBehavior) => void;
	onStatusChange: (status: ItemStatus) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onParentChange: (parentId: string) => void;
};

const AccountingFields: Array<{
	key: keyof ItemCategoryAccountingSetup;
	label: string;
	parentAccount?: string;
	requirementKey: AccountingRequirementKey;
}> = [
	{
		key: "inventoryAccount",
		label: "Inventory Account",
		parentAccount: "Item Inventories",
		requirementKey: "requiresInventoryAccount",
	},
	{
		key: "salesAccount",
		label: "Sales Account",
		parentAccount: "Item Sales",
		requirementKey: "requiresSalesAccount",
	},
	{
		key: "costOfSalesAccount",
		label: "Cost of Sales Account",
		parentAccount: "Item Cost of Sales",
		requirementKey: "requiresCostOfSalesAccount",
	},
	{
		key: "expenseAccount",
		label: "Expense Account",
		parentAccount: "Item Expenses",
		requirementKey: "requiresExpenseAccount",
	},
];

type AccountingRequirementKey =
	| "requiresInventoryAccount"
	| "requiresSalesAccount"
	| "requiresCostOfSalesAccount"
	| "requiresExpenseAccount";

const AccountingRequirementOptions: Array<{
	key: AccountingRequirementKey;
	label: string;
}> = [
	{ key: "requiresInventoryAccount", label: "Inventory Account" },
	{ key: "requiresSalesAccount", label: "Sales Account" },
	{
		key: "requiresCostOfSalesAccount",
		label: "Cost of Sales Account",
	},
	{ key: "requiresExpenseAccount", label: "Expense Account" },
];

type ItemCategoryFormTab = "Basic Information" | "Item Behavior" | "Accounting Setup";

const ItemCategoryFormTabs: ItemCategoryFormTab[] = [
	"Basic Information",
	"Item Behavior",
	"Accounting Setup",
];

export function ItemCategoryFields({
	errors,
	isReadonly,
	onAccountRequirementChange,
	onAccountingModeChange,
	onAllowSubCategoryChange,
	onBehaviorChange,
	onStatusChange,
	onInputChange,
	onParentChange,
	parentOptions,
	values,
}: ItemCategoryFieldsProps) {
	const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map(
		(option) => ({
			label: option.pathName,
			name: option.label,
			value: option.id,
		}),
	);
	const [selectedTab, setSelectedTab] =
		useState<ItemCategoryFormTab>("Basic Information");
	const selectedParentName =
		parentOptions.find((option) => option.id === values.parentId)?.label ??
		"parent";
	const inheritedAccountingSetup =
		parentOptions.find((option) => option.id === values.parentId)
			?.accountingSetup ?? values.accountingSetup;
	const previewAccountingSetup =
		values.accountingSetupMode === "inherit"
			? inheritedAccountingSetup
			: values.accountingSetup;

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
			<ItemCategoryTabs value={selectedTab} onChange={setSelectedTab} />

			<div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-5">
				{selectedTab === "Basic Information" ? (
					<div className="grid gap-4">
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
								placeholder="No parent category"
								readOnly={isReadonly}
								searchPlaceholder="Search parent category"
								showSelectionIndicator={false}
								showSelectedDetails
								value={values.parentId}
								onChange={(value) => onParentChange(String(value))}
							/>
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
						<div className="mt-2 grid gap-4 lg:grid-cols-2">
							<FormField label="Allow Subcategories">
								<AppSwitch
									className="!w-full !min-w-0"
									falseOption={SubcategoriesNotAllowedSwitchOption}
									readOnly={isReadonly}
									trueOption={SubcategoriesAllowedSwitchOption}
									value={values.allowSubCategory ? "allowed" : "notAllowed"}
									onChange={(value) => onAllowSubCategoryChange(value === "allowed")}
								/>
							</FormField>
							<FormField label="Status" error={errors.status} required>
								<AppSwitch
									className="!w-full !min-w-0"
									falseOption={InactiveStatusSwitchOption}
									readOnly={isReadonly}
									trueOption={ActiveStatusSwitchOption}
									value={values.status}
									onChange={onStatusChange}
								/>
							</FormField>
						</div>
					</div>
				) : null}

				{selectedTab === "Item Behavior" ? (
					<div>
						<div className="mb-4">
							<h3 className="text-sm font-semibold text-darknavy">Item Behavior</h3>
							<p className="mt-1 text-xs leading-5 text-darknavy/55">
								Select one or more behaviors inherited by items in this category.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{ItemBehaviorGuide.map((behavior) => {
								const isSelected = values.behaviors.includes(behavior.title);

								return (
									<button
										key={behavior.title}
										type="button"
										aria-pressed={isSelected}
										disabled={isReadonly}
										onClick={() => onBehaviorChange(behavior.title)}
										className={[
											"relative min-h-20 rounded-md border p-3 pr-11 text-left transition",
											isSelected
												? "border-skyblue bg-skyblue/5 ring-2 ring-skyblue/15"
												: "border-darknavy/10 bg-offwhite/55 hover:border-skyblue/55 hover:bg-skyblue/5",
											isReadonly ? "cursor-default opacity-75" : "cursor-pointer",
										].join(" ")}
									>
										<div className="text-sm font-semibold text-darknavy">{behavior.title}</div>
										<span
											className={`absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border transition ${isSelected ? "border-skyblue bg-skyblue text-white" : "border-darknavy/15 bg-white"}`}
										>
											{isSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
										</span>
										<p className="mt-1 text-xs leading-5 text-darknavy/65">{behavior.description}</p>
									</button>
								);
							})}
						</div>
						{errors.behaviors ? (
							<span className="mt-2 block text-xs font-medium text-coralpink">{errors.behaviors}</span>
						) : null}
					</div>
				) : null}

				{selectedTab === "Accounting Setup" ? (
					<div>
						<div>
							<span className="mb-2 block text-sm font-semibold text-darknavy">
								Account Requirements
							</span>
							<p className="mb-2 text-xs leading-5 text-darknavy/55">
								Select the accounts required for this category. At least one is required.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{AccountingRequirementOptions.map((option) => (
									<AppSwitch
										key={option.key}
										className="w-full sm:!min-w-0"
										falseOption={{ label: option.label, value: "notRequired" }}
										readOnly={isReadonly}
										trueOption={{ label: option.label, value: "required" }}
										value={values[option.key] ? "required" : "notRequired"}
										onChange={(value) =>
											onAccountRequirementChange(option.key, value === "required")
										}
									/>
								))}
							</div>
							{errors.requiresInventoryAccount ? (
								<span className="mt-2 block text-xs font-medium text-coralpink">
									{errors.requiresInventoryAccount}
								</span>
							) : null}
						</div>

						<div className="mt-5 flex flex-col gap-3 border-b border-darknavy/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="max-w-sm text-sm leading-6 text-darknavy/60">
								Inherit parent accounts or auto-create item COA accounts.
							</div>
							<div
								role="radiogroup"
								aria-label="Accounting setup mode"
								className="grid shrink-0 gap-2 sm:grid-cols-2"
							>
								<AccountingModeOption
									checked={values.accountingSetupMode === "inherit"}
									disabled={isReadonly || !values.parentId}
									label="Inherit Parent"
									onChange={() => onAccountingModeChange("inherit")}
								/>
								<AccountingModeOption
									checked={values.accountingSetupMode === "own"}
									disabled={isReadonly}
									label="Auto-Create"
									onChange={() => onAccountingModeChange("own")}
								/>
							</div>
						</div>

						{values.accountingSetupMode === "inherit" ? (
							<div className="mt-4 flex gap-3 rounded-lg border border-skyblue/20 bg-skyblue/10 p-3 text-sm leading-6 text-darknavy/70">
								<Info
									className="mt-0.5 h-4 w-4 shrink-0 text-skyblue"
									aria-hidden="true"
								/>
								<span>
									This category uses the accounting setup from{" "}
									<strong>{selectedParentName}</strong>.
								</span>
							</div>
						) : null}
						<div className="mt-4 grid gap-4 lg:grid-cols-2">
							{AccountingFields.filter(
								(field) => values[field.requirementKey],
							).map((field) => (
								<FormField
									key={field.key}
									label={field.label}
									error={
										values[field.requirementKey] ? errors[field.key] : undefined
									}
									required={
										values.accountingSetupMode === "own" &&
										values[field.requirementKey]
									}
								>
									<div className="grid gap-2">
										<input
											value={previewAccountingSetup[field.key]}
											readOnly
											className={fieldClassName}
										/>
										{field.parentAccount ? (
											<span className="text-xs font-medium text-darknavy/45">
												Under {field.parentAccount}
											</span>
										) : null}
									</div>
								</FormField>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

function ItemCategoryTabs({
	onChange,
	value,
}: {
	onChange: (value: ItemCategoryFormTab) => void;
	value: ItemCategoryFormTab;
}) {
	return (
		<div className="flex h-10 shrink-0 items-end gap-5 border-b border-darknavy/10 px-6">
			{ItemCategoryFormTabs.map((option) => {
				const isActive = value === option;

				return (
					<button
						key={option}
						type="button"
						onClick={() => onChange(option)}
						className={[
							"h-9 whitespace-nowrap border-b-2 text-sm font-semibold transition",
							isActive
								? "border-skyblue text-skyblue"
								: "border-transparent text-darknavy/45 hover:text-darknavy/70",
						].join(" ")}
					>
						{option}
					</button>
				);
			})}
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
			className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
				checked
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

const ActiveStatusSwitchOption = { label: "Active", value: "Active" } as const;
const InactiveStatusSwitchOption = { label: "Inactive", value: "Inactive" } as const;
const SubcategoriesAllowedSwitchOption = { label: "Allowed", value: "allowed" } as const;
const SubcategoriesNotAllowedSwitchOption = { label: "Not Allowed", value: "notAllowed" } as const;

const ItemBehaviorGuide = [
	{ title: "Sellable Item", description: "An item you can sell to customers." },
	{ title: "Purchasable Item", description: "An item you can buy from suppliers." },
	{
		title: "Issuable Item",
		description: "Tracks items issued for internal use or distribution.",
	},
	{
		title: "Returnable Item",
		description: "Tracks items expected to be returned after use or delivery.",
	},
	{
		title: "Non-Inventory Item",
		description: "A bought or sold item where stock quantity is not tracked.",
	},
	{ title: "Raw Material", description: "A material used to make another product." },
	{ title: "Semi-Finished Goods/WIP", description: "A partly finished product still used in production." },
	{ title: "Finished Goods", description: "A completed product ready to sell." },
	{ title: "Asset Item", description: "A long-term company asset, not for regular sale." },
	{ title: "Consumable Item", description: "An internal-use item that gets used up." },
] as const satisfies ReadonlyArray<{ title: ItemBehavior; description: string }>;
