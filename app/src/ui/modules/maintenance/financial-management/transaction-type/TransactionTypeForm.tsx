import type { ChangeEventHandler, ReactNode } from "react";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

type TransactionTypeFormProps = {
	errors: TransactionTypeFormErrors;
	isReadonly: boolean;
	values: TransactionTypeFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export function TransactionTypeForm({
	errors,
	isReadonly,
	values,
	onInputChange,
}: TransactionTypeFormProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-3">
				<FormField label="Type" error={errors.type} required>
					<input
						name="type"
						value={values.type}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter code"
					/>
				</FormField>

				<FormField
					label="Description"
					error={errors.description}
					required
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

				<FormField
					label="Account Code"
					error={errors.accountCode}
					required
				>
					<input
						name="accountCode"
						value={values.accountCode}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter account code"
					/>
				</FormField>

				<FormField
					label="Account Title"
					error={errors.accountTitle}
					required
				>
					<input
						name="accountTitle"
						value={values.accountTitle}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter account title"
					/>
				</FormField>

				<FormField label="Status" error={errors.status}>
					<select
						name="status"
						value={values.status}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{TransactionTypeStatusOptions.map((statusOption) => (
							<option key={statusOption} value={statusOption}>
								{statusOption}
							</option>
						))}
					</select>
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
