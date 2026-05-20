"use client";

import { Landmark } from "lucide-react";
import {
	AccountCategories,
	AccountStatuses,
	AccountTypes,
	NormalBalances,
	StatementGroups,
	StatementSections,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	ChartAccount,
	ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Field,
	Input,
	Select,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

type AccountFieldsProps = {
	account: ChartAccount | null;
	accounts: ChartAccount[];
	submitted: boolean;
	values: ChartAccountFormValues;
	onFieldChange: <Key extends keyof ChartAccountFormValues>(
		key: Key,
		value: ChartAccountFormValues[Key],
	) => void;
};

export function ChartsOfAccountsAccountFields({
	account,
	accounts,
	submitted,
	values,
	onFieldChange,
}: AccountFieldsProps) {
	const isInvalid =
		submitted && (!values.accountNumber || !values.accountName);
	const showBankDetails = values.accountCategory === "Cash in Bank";

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<RequiredTextField
				error={
					isInvalid && !values.accountNumber ? "Required" : undefined
				}
				label="Account Number"
				placeholder="1110"
				submitted={submitted}
				value={values.accountNumber}
				onChange={(value) => onFieldChange("accountNumber", value)}
			/>
			<RequiredTextField
				error={
					isInvalid && !values.accountName ? "Required" : undefined
				}
				label="Account Name"
				placeholder="Cash in Bank - BDO"
				submitted={submitted}
				value={values.accountName}
				onChange={(value) => onFieldChange("accountName", value)}
			/>

			<ParentAccountField
				account={account}
				accounts={accounts}
				value={values.parentId}
				onChange={(value) => onFieldChange("parentId", value)}
			/>

			<SelectField
				label="Account Type"
				value={values.accountType}
				options={AccountTypes}
				onChange={(value) =>
					onFieldChange("accountType", value as never)
				}
			/>
			<SelectField
				label="Statement Group"
				value={values.statementGroup}
				options={StatementGroups}
				onChange={(value) =>
					onFieldChange("statementGroup", value as never)
				}
			/>
			<SelectField
				label="Statement Section"
				value={values.statementSection}
				options={StatementSections}
				onChange={(value) => onFieldChange("statementSection", value)}
			/>
			<SelectField
				label="Normal Balance"
				value={values.normalBalance}
				options={NormalBalances}
				onChange={(value) =>
					onFieldChange("normalBalance", value as never)
				}
			/>
			<SelectField
				label="Account Category"
				value={values.accountCategory}
				options={AccountCategories}
				onChange={(value) =>
					onFieldChange("accountCategory", value as never)
				}
			/>

			<DescriptionField
				value={values.description}
				onChange={(value) => onFieldChange("description", value)}
			/>

			<SelectField
				label="Status"
				value={values.status}
				options={AccountStatuses}
				onChange={(value) => onFieldChange("status", value as never)}
			/>

			<ReportsField
				checked={values.showInReports}
				onChange={(checked) => onFieldChange("showInReports", checked)}
			/>

			{showBankDetails ? <BankDetailsNotice /> : null}
		</div>
	);
}

function RequiredTextField({
	error,
	label,
	placeholder,
	submitted,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	placeholder: string;
	submitted: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Field label={label} error={error}>
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={
					submitted && !value
						? "border-red-300 ring-2 ring-red-100"
						: undefined
				}
				placeholder={placeholder}
			/>
		</Field>
	);
}

function ParentAccountField({
	account,
	accounts,
	value,
	onChange,
}: {
	account: ChartAccount | null;
	accounts: ChartAccount[];
	value: string | null;
	onChange: (value: string | null) => void;
}) {
	return (
		<Field label="Parent Account">
			<Select
				value={value ?? ""}
				onChange={(event) => onChange(event.target.value || null)}
			>
				<option value="">No parent account</option>
				{accounts
					.filter((item) => item.id !== account?.id)
					.map((item) => (
						<option key={item.id} value={item.id}>
							{item.accountNumber} - {item.accountName}
						</option>
					))}
			</Select>
		</Field>
	);
}

function SelectField({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Field label={label}>
			<Select
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</Select>
		</Field>
	);
}

function DescriptionField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Field label="Description" className="sm:col-span-2">
			<textarea
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Internal reporting notes"
				className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
			/>
		</Field>
	);
}

function ReportsField({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
			<span>
				<span className="block text-sm font-semibold text-slate-800">
					Show in Reports
				</span>
				<span className="text-xs text-slate-500">
					Include this account in financial statements
				</span>
			</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="h-5 w-5 rounded border-slate-300 text-blue-600"
			/>
		</label>
	);
}

function BankDetailsNotice() {
	return (
		<div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 sm:col-span-2">
			<div className="flex items-start gap-3">
				<Landmark
					className="mt-0.5 h-5 w-5 text-blue-700"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-slate-950">
						Bank details enabled
					</p>
					<p className="mt-1 text-sm text-slate-600">
						Use the Bank Details tab to maintain branch, currency,
						and opening balance information.
					</p>
				</div>
			</div>
		</div>
	);
}
