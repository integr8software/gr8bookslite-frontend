import type { ChangeEventHandler, ReactNode } from "react";
import { ItemStatusOptions } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupFormErrors,
	ItemSetupFormValues,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemSetupFieldsProps = {
	errors: ItemSetupFormErrors;
	isReadonly: boolean;
	values: ItemSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function ItemSetupFields({
	errors,
	isReadonly,
	onInputChange,
	values,
}: ItemSetupFieldsProps) {
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
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

