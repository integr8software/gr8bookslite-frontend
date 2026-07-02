import { isValidElement, useId } from "react";
import type { ChangeEventHandler, ReactNode } from "react";
import {
	BankMasterfileAccountTypeOptions,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import { buildBankMasterfileAccountName } from "@/app/src/data/modules/maintenance/financial-management/bank-masterfile/BankMasterfileData";
import type {
	BankMasterfileFormErrors,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

type BankMasterfileFieldsProps = {
	accountCode: string;
	errors: BankMasterfileFormErrors;
	isAccountCodeLoading: boolean;
	isReadonly: boolean;
	mode: "add" | "edit" | "view";
	values: BankMasterfileFormValues;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
};

export function BankMasterfileFields({
	accountCode,
	errors,
	isAccountCodeLoading,
	isReadonly,
	mode,
	values,
	onInputChange,
}: BankMasterfileFieldsProps) {
	const accountName = buildBankMasterfileAccountName(values);

	return (
		<div className="grid gap-5">
			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-2">
					<FormField label="Bank" error={errors.bankName} required>
						<input
							id="bank-masterfile-bank-name"
							name="bankName"
							value={values.bankName}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="BDO"
						/>
					</FormField>
					<FormField label="Branch" error={errors.branch}>
						<input
							id="bank-masterfile-branch"
							name="branch"
							value={values.branch}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Makati Branch"
						/>
					</FormField>
					<FormField
						label="Account Number"
						error={errors.accountNumber}
						helper={
							values.status === "Inactive" && !values.accountNumber.trim()
								? "Add an account number to activate this bank."
								: undefined
						}
						required={values.status === "Active"}
					>
						<input
							id="bank-masterfile-account-number"
							name="accountNumber"
							value={values.accountNumber}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Required before activation"
						/>
					</FormField>
					<FormField label="Account Type" error={errors.accountType}>
						<select
							id="bank-masterfile-account-type"
							name="accountType"
							value={values.accountType}
							onChange={onInputChange}
							disabled={isReadonly}
							className={selectClassName}
						>
							{BankMasterfileAccountTypeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Account Title"
						className="lg:col-span-2"
						required={values.status === "Active"}
					>
						<input
							id="bank-masterfile-account-title"
							value={accountName}
							readOnly
							className={readOnlyFieldClassName}
						/>
					</FormField>
					<FormField label="Account Code">
						<input
							id="bank-masterfile-account-code"
							value={
								mode === "add"
									? isAccountCodeLoading
										? "Loading..."
										: accountCode || "Auto series"
									: accountCode
							}
							readOnly
							className={readOnlyFieldClassName}
						/>
					</FormField>
					<FormField label="Status" error={errors.status} required>
						<select
							id="bank-masterfile-status"
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={selectClassName}
						>
							{BankMasterfileStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Currency" error={errors.currencyCode} required>
						<input
							id="bank-masterfile-currency-code"
							name="currencyCode"
							value={values.currencyCode}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="PHP"
							maxLength={10}
						/>
					</FormField>
					<FormField label="Exchange Rate" error={errors.currencyExchangeRate}>
						<input
							id="bank-masterfile-currency-exchange-rate"
							name="currencyExchangeRate"
							type="number"
							min="0"
							step="any"
							value={values.currencyExchangeRate}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="Required for non-PHP"
						/>
					</FormField>
					<label
						htmlFor="bank-masterfile-is-default"
						className="flex min-h-11 items-center justify-between rounded-lg border border-darknavy/10 px-3 text-sm font-semibold text-darknavy"
					>
						Default Bank
						<input
							id="bank-masterfile-is-default"
							name="isDefault"
							type="checkbox"
							checked={values.isDefault}
							onChange={onInputChange}
							disabled={isReadonly}
							className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20"
						/>
					</label>
				</div>
			</div>

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-3">
					<FormField label="Series Start" error={errors.seriesStart}>
						<input
							id="bank-masterfile-series-start"
							name="seriesStart"
							value={values.seriesStart}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="000001"
						/>
					</FormField>
					<FormField label="Series End" error={errors.seriesEnd}>
						<input
							id="bank-masterfile-series-end"
							name="seriesEnd"
							value={values.seriesEnd}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="999999"
						/>
					</FormField>
					<FormField label="Series Digits" error={errors.seriesDigits}>
						<input
							id="bank-masterfile-series-digits"
							name="seriesDigits"
							type="number"
							min="1"
							value={values.seriesDigits}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="6"
						/>
					</FormField>
				</div>
			</div>
		</div>
	);
}

function FormField({
	children,
	className,
	error,
	helper,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	helper?: string;
	label: string;
	required?: boolean;
}) {
	const generatedId = useId();
	const fieldId = isValidElement<{ id?: string }>(children)
		? children.props.id ?? generatedId
		: generatedId;

	return (
		<div className={className}>
			<label
				htmlFor={fieldId}
				className="mb-2 block text-sm font-semibold text-darknavy"
			>
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</label>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : helper ? (
				<span className="mt-1 block text-xs font-medium text-darknavy/55">
					{helper}
				</span>
			) : null}
		</div>
	);
}

const fieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";

const readOnlyFieldClassName = `${fieldClassName} bg-darknavy/[0.03] font-semibold text-darknavy/80`;

const selectClassName = `app-select-control ${fieldClassName} enabled:bg-white enabled:text-darknavy disabled:bg-darknavy/[0.03] disabled:text-darknavy/70`;
