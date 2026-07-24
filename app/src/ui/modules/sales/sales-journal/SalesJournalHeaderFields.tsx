import type { ChangeEventHandler } from "react";
import { SalesJournalCurrencyOptions } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";

const fieldClassName =
	"app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
const errorClassName = "mt-1 text-xs font-medium text-red-600";

type SalesJournalHeaderFieldsProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
};

export function SalesJournalHeaderFields({
	page,
}: SalesJournalHeaderFieldsProps) {
	return (
		<div className="grid gap-x-8 gap-y-4 xl:grid-cols-3">
			<div className="grid content-start gap-4">
				<TextField
					label="Party Name"
					name="partyName"
					value={page.values.partyName}
					error={page.errors.partyName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Address"
					name="address"
					value={page.values.address}
					error={page.errors.address}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Contact Person"
					name="contactPerson"
					value={page.values.contactPerson}
					error={page.errors.contactPerson}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Contact No"
					name="contactNo"
					value={page.values.contactNo}
					error={page.errors.contactNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Project Name"
					name="projectName"
					value={page.values.projectName}
					error={page.errors.projectName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={page.values.remarks}
					error={page.errors.remarks}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Party Code"
					name="partyCode"
					value={page.values.partyCode}
					error={page.errors.partyCode}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Terms of Pyt"
					name="terms"
					value={page.values.terms}
					error={page.errors.terms}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Due Date"
					name="dueDate"
					type="date"
					value={page.values.dueDate}
					error={page.errors.dueDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<SelectField
					label="Currency"
					name="currency"
					value={page.values.currency}
					error={page.errors.currency}
					disabled={page.isReadonly}
					options={SalesJournalCurrencyOptions}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="ER"
					name="exchangeRate"
					type="number"
					min="0"
					step="0.000001"
					value={String(page.values.exchangeRate)}
					error={page.errors.exchangeRate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Res Center"
					name="resCenter"
					value={page.values.resCenter}
					error={page.errors.resCenter}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="SI No"
					name="siNo"
					value={page.values.siNo}
					error={page.errors.siNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="SI Date"
					name="documentDate"
					type="date"
					value={page.values.documentDate}
					error={page.errors.documentDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="SO No"
					name="soNo"
					value={page.values.soNo}
					error={page.errors.soNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="PO No."
					name="poNo"
					value={page.values.poNo}
					error={page.errors.poNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Sales Personnel"
					name="salesPersonnel"
					value={page.values.salesPersonnel}
					error={page.errors.salesPersonnel}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
		</div>
	);
}

type FieldProps = {
	disabled: boolean;
	error?: string;
	label: string;
	name: string;
	onChange: ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>;
	value: string;
	type?: string;
	min?: string;
	step?: string;
};

function TextField({
	disabled,
	error,
	label,
	name,
	onChange,
	value,
	type = "text",
	min,
	step,
}: FieldProps) {
	return (
		<label className="block">
			<FieldLabel label={label} />
			<input
				className={fieldClassName}
				disabled={disabled}
				min={min}
				name={name}
				onChange={onChange}
				step={step}
				type={type}
				value={value}
			/>
			{error ? <span className={errorClassName}>{error}</span> : null}
		</label>
	);
}

function TextAreaField({
	disabled,
	error,
	label,
	name,
	onChange,
	value,
}: FieldProps) {
	return (
		<label className="block">
			<FieldLabel label={label} />
			<textarea
				className={`${fieldClassName} min-h-28 py-3`}
				disabled={disabled}
				name={name}
				onChange={onChange}
				value={value}
			/>
			{error ? <span className={errorClassName}>{error}</span> : null}
			<span className="mt-1 block text-xs font-medium text-darknavy/45">
				Characters remaining: {Math.max(250 - value.length, 0)}
			</span>
		</label>
	);
}

function SelectField({
	disabled,
	error,
	label,
	name,
	onChange,
	options,
	value,
}: FieldProps & { options: readonly string[] }) {
	return (
		<label className="block">
			<FieldLabel label={label} />
			<select
				className={fieldClassName}
				disabled={disabled}
				name={name}
				onChange={onChange}
				value={value}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			{error ? <span className={errorClassName}>{error}</span> : null}
		</label>
	);
}

function FieldLabel({ label }: { label: string }) {
	return (
		<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
			{label}
		</span>
	);
}
