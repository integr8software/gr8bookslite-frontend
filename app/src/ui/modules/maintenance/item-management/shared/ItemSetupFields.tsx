import type { ChangeEventHandler, ReactNode } from "react";
import {
	ItemSetupAllParentsValue,
	ItemSetupConfigByKind,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupFormErrors,
	ItemSetupFormValues,
	ItemSetupKind,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ItemSetupFieldsProps = {
	errors: ItemSetupFormErrors;
	isReadonly: boolean;
	parentKind?: ItemSetupKind;
	parentOptions: AppAdvancedDropdownOption[];
	values: ItemSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onParentIdsChange: (parentIds: string[]) => void;
};

export function ItemSetupFields({
	errors,
	isReadonly,
	onInputChange,
	onParentIdsChange,
	parentKind,
	parentOptions,
	values,
}: ItemSetupFieldsProps) {
	const selectedParentIds =
		parentKind && values.parentIds.length === 0
			? [ItemSetupAllParentsValue]
			: values.parentIds;

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<FormField label="Code" error={errors.code} required>
					<input
						name="code"
						value={values.code}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Code"
					/>
				</FormField>
				<FormField label="Name" error={errors.name} required>
					<input
						name="name"
						value={values.name}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Name"
					/>
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
				{parentKind ? (
					<FormField
						label={`Applies To ${ItemSetupConfigByKind[parentKind].title}`}
						error={errors.parentIds}
					>
						<AppAdvancedDropdown
							isClearable
							options={parentOptions}
							placeholder={`Reusable across all ${ItemSetupConfigByKind[
								parentKind
							].title.toLowerCase()} records`}
							readOnly={isReadonly}
							searchPlaceholder="Search parent records"
							selectionMode="multiple"
							value={selectedParentIds}
							onChange={(nextValue) => {
								const parentIds = Array.isArray(nextValue)
									? nextValue
									: [nextValue];

								onParentIdsChange(
									parentIds.filter(
										(parentId) => parentId !== ItemSetupAllParentsValue,
									),
								);
							}}
							onSelectOption={(option) => {
								if (option.value === ItemSetupAllParentsValue) {
									onParentIdsChange([]);
								}
							}}
						/>
					</FormField>
				) : null}
				<FormField label="Description" error={errors.description}>
					<textarea
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={`${fieldClassName} min-h-24 py-3`}
						placeholder="Description"
					/>
				</FormField>
			</div>
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
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
