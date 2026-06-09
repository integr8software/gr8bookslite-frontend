import type { ChangeEventHandler, FormEvent, ReactNode } from "react";
import {
	TransactionNumberInputModeOptions,
	TransactionNumberModuleOptions,
	TransactionNumberScopeOptions,
	TransactionNumberStatusOptions,
} from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type {
	TransactionNumberModuleCode,
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupFormProps = {
	branchOptions: Array<{
		code: string;
		id: string;
		name: string;
	}>;
	errors: TransactionNumberSetupFormErrors;
	isReadonly: boolean;
	nextNumberPreview: string;
	values: TransactionNumberSetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onModuleCodeChange: (moduleCode: TransactionNumberModuleCode) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onToggleBranch: (branchId: string) => void;
};

export function TransactionNumberSetupForm({
	branchOptions,
	errors,
	isReadonly,
	nextNumberPreview,
	onInputChange,
	onModuleCodeChange,
	onSubmit,
	onToggleBranch,
	values,
}: TransactionNumberSetupFormProps) {
	const isAllBranches = values.scope === "all";

	return (
		<form id="transaction-number-setup-form" onSubmit={onSubmit} className="grid gap-5">
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">Number Format</h2>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<FormField
						label="Module"
						fieldId="transaction-number-module-code"
						error={errors.moduleCode}
						required
					>
						<select
							id="transaction-number-module-code"
							name="moduleCode"
							value={values.moduleCode}
							onChange={(event) =>
								onModuleCodeChange(
									event.target.value as TransactionNumberModuleCode,
								)
							}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="">Select module</option>
							{TransactionNumberModuleOptions.map((option) => (
								<option key={option.code} value={option.code}>
									{option.name} - {option.defaultPrefix}
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Transaction Number Mode"
						fieldId="transaction-number-input-mode"
						error={errors.inputMode}
						required
					>
						<select
							id="transaction-number-input-mode"
							name="inputMode"
							value={values.inputMode}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{TransactionNumberInputModeOptions.map((mode) => (
								<option key={mode} value={mode}>
									{mode}
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Prefix"
						fieldId="transaction-number-prefix"
						error={errors.prefix}
						required
					>
						<input
							id="transaction-number-prefix"
							name="prefix"
							value={values.prefix}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="PTY"
						/>
					</FormField>
					<FormField
						label="Number Padding"
						fieldId="transaction-number-padding"
						error={errors.padding}
						required
					>
						<input
							id="transaction-number-padding"
							name="padding"
							type="number"
							min={1}
							max={12}
							value={values.padding}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
						/>
					</FormField>
					<FormField
						label="Starting Number"
						fieldId="transaction-number-starting-number"
						error={errors.startingNumber}
						required
					>
						<input
							id="transaction-number-starting-number"
							name="startingNumber"
							type="number"
							min={0}
							value={values.startingNumber}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
						/>
					</FormField>
					<FormField
						label="Current Running Number"
						fieldId="transaction-number-current-number"
						error={errors.currentNumber}
						required
					>
						<input
							id="transaction-number-current-number"
							name="currentNumber"
							type="number"
							min={0}
							value={values.currentNumber}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
						/>
					</FormField>
					<FormField label="Generated Preview">
						<div className="flex min-h-11 items-center rounded-md border border-darknavy/10 bg-offwhite/55 px-3 font-mono text-sm font-semibold text-darknavy">
							{nextNumberPreview}
						</div>
					</FormField>
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">Branch Scope</h2>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<FormField
						label="Numbering Mode"
						fieldId="transaction-number-scope"
						error={errors.scope}
						required
					>
						<select
							id="transaction-number-scope"
							name="scope"
							value={values.scope}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{TransactionNumberScopeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Status"
						fieldId="transaction-number-status"
						error={errors.status}
						required
					>
						<select
							id="transaction-number-status"
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{TransactionNumberStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>
					<div className="lg:col-span-2">
						<div className="mb-2 flex items-center justify-between gap-3">
							<span className="text-sm font-semibold text-darknavy">
								Branches
							</span>
						</div>
						<div className="grid gap-2 md:grid-cols-3">
							{branchOptions.map((branch) => {
								const checked =
									isAllBranches || values.branchIds.includes(branch.id);

								return (
									<label
										key={branch.id}
										className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/55 px-3 text-sm font-semibold text-darknavy"
									>
										<input
											type={values.scope === "branch" ? "radio" : "checkbox"}
											checked={checked}
											disabled={isReadonly || isAllBranches}
											onChange={() => onToggleBranch(branch.id)}
											className="h-4 w-4 accent-skyblue disabled:cursor-default"
										/>
										<span className="min-w-0">
											<span className="block truncate">{branch.name}</span>
											<span className="block text-xs text-darknavy/45">
												{branch.code}
											</span>
										</span>
									</label>
								);
							})}
						</div>
						{errors.branchIds ? (
							<span className="mt-1 block text-xs font-medium text-coralpink">
								{errors.branchIds}
							</span>
						) : null}
					</div>
					<FormField
						label="Description"
						fieldId="transaction-number-description"
						error={errors.description}
						wide
					>
						<textarea
							id="transaction-number-description"
							name="description"
							value={values.description}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={`${fieldClassName} min-h-24 py-3`}
							placeholder="Sequence notes"
						/>
					</FormField>
				</div>
			</section>
		</form>
	);
}

function FormField({
	children,
	error,
	fieldId,
	label,
	required,
	wide,
}: {
	children: ReactNode;
	error?: string;
	fieldId?: string;
	label: string;
	required?: boolean;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "lg:col-span-2" : undefined}>
			{fieldId ? (
				<label
					htmlFor={fieldId}
					className="mb-2 block text-sm font-semibold text-darknavy"
				>
					{label}
					{required ? <span className="text-coralpink"> *</span> : null}
				</label>
			) : (
				<span className="mb-2 block text-sm font-semibold text-darknavy">
					{label}
					{required ? <span className="text-coralpink"> *</span> : null}
				</span>
			)}
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
