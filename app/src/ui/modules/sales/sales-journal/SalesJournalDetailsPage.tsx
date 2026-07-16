import type { ChangeEventHandler } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
	SalesJournalCurrencyOptions,
	SalesJournalStatusOptions,
	SalesJournalVatTypeOptions,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import { formatSalesJournalAmount } from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

const fieldClassName =
	"app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
const errorClassName = "mt-1 text-xs font-medium text-red-600";

type SalesJournalDetailsPageProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
	section: SalesJournalDetailsSection;
};

export type SalesJournalDetailsSection = "amounts" | "customer" | "references";

export function SalesJournalDetailsPage({
	page,
	section,
}: SalesJournalDetailsPageProps) {
	return (
		<>
			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				{section === "customer" ? <SalesJournalCustomerSection page={page} /> : null}
				{section === "amounts" ? <SalesJournalAmountsSection page={page} /> : null}
				{section === "references" ? (
					<SalesJournalReferencesSection page={page} />
				) : null}
			</section>

			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-darknavy">Details</h2>
						<p className="text-sm text-darknavy/60">
							Line items must balance before the sales journal can be saved.
						</p>
					</div>
					<button
						type="button"
						className={moduleHeaderActionClassNames.secondary}
						onClick={page.addLine}
						disabled={page.isReadonly}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Row
					</button>
				</div>

				{page.errors.lines ? (
					<p className={errorClassName}>{page.errors.lines}</p>
				) : null}

				<div className="overflow-x-auto">
					<table className="min-w-[1500px] w-full text-left text-sm">
						<thead className="bg-offwhite text-xs uppercase tracking-wide text-darknavy/60">
							<tr>
								<th className="px-3 py-3">Line Number</th>
								<th className="px-3 py-3">Account Code</th>
								<th className="px-3 py-3">Account Title</th>
								<th className="px-3 py-3 text-right">Debit</th>
								<th className="px-3 py-3 text-right">Credit</th>
								<th className="px-3 py-3">Particulars</th>
								<th className="px-3 py-3">Party Code</th>
								<th className="px-3 py-3">Party Name</th>
								<th className="px-3 py-3">Responsibility Center</th>
								<th className="px-3 py-3">Ref No</th>
								<th className="px-3 py-3">VAT Type</th>
								<th className="px-3 py-3">ATC Code</th>
								<th className="px-3 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-darknavy/10">
							{page.values.lines.map((line) => {
								const lineErrors = page.errors.lineErrors?.[line.id] ?? {};

								return (
									<tr key={line.id} className="align-top">
										<td className="px-3 py-3 font-semibold text-darknavy">
											{line.lineNumber}
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.accountCode}
												error={lineErrors.accountCode}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "accountCode", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.accountTitle}
												error={lineErrors.accountTitle}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "accountTitle", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												type="number"
												min="0"
												step="0.01"
												value={String(line.debit)}
												error={lineErrors.debit}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "debit", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												type="number"
												min="0"
												step="0.01"
												value={String(line.credit)}
												error={lineErrors.credit}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "credit", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.particulars}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "particulars", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.partyCode}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "partyCode", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.partyName}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "partyName", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.responsibilityCenter}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(
														line.id,
														"responsibilityCenter",
														value,
													)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.refNo}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "refNo", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineSelect
												value={line.vatType}
												disabled={page.isReadonly}
												options={SalesJournalVatTypeOptions}
												onChange={(value) =>
													page.updateLine(line.id, "vatType", value)
												}
											/>
										</td>
										<td className="px-3 py-3">
											<LineInput
												value={line.atcCode}
												disabled={page.isReadonly}
												onChange={(value) =>
													page.updateLine(line.id, "atcCode", value)
												}
											/>
										</td>
										<td className="px-3 py-3 text-right">
											<button
												type="button"
												className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
												onClick={() => page.deleteLine(line.id)}
												disabled={page.isReadonly}
												aria-label={`Delete line ${line.lineNumber}`}
											>
												<Trash2 className="h-4 w-4" aria-hidden="true" />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot className="border-t border-darknavy/15 bg-offwhite font-semibold text-darknavy">
							<tr>
								<td colSpan={3} className="px-3 py-3 text-right">
									Totals
								</td>
								<td className="px-3 py-3 text-right tabular-nums">
									{formatSalesJournalAmount(page.totals.totalDebit)}
								</td>
								<td className="px-3 py-3 text-right tabular-nums">
									{formatSalesJournalAmount(page.totals.totalCredit)}
								</td>
								<td colSpan={8} className="px-3 py-3">
									<span
										className={
											page.totals.isBalanced
												? "text-emerald-700"
												: "text-red-600"
										}
									>
										Variance:{" "}
										{formatSalesJournalAmount(Math.abs(page.totals.variance))}
									</span>
									{page.errors.balance ? (
										<span className="ml-4 text-red-600">
											{page.errors.balance}
										</span>
									) : null}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</section>
		</>
	);
}

function SalesJournalCustomerSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid gap-4">
				<TextField
					label="Code"
					name="partyCode"
					value={page.values.partyCode}
					error={page.errors.partyCode}
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
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={page.values.remarks}
					error={page.errors.remarks}
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
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Name"
					name="partyName"
					value={page.values.partyName}
					error={page.errors.partyName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="FX Rate"
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
					label="Terms"
					name="terms"
					value={page.values.terms}
					error={page.errors.terms}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
		</div>
	);
}

function SalesJournalAmountsSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid content-start gap-4">
				<ReadOnlyField
					label="Total Debit"
					value={formatSalesJournalAmount(page.totals.totalDebit)}
				/>
				<ReadOnlyField
					label="Total Credit"
					value={formatSalesJournalAmount(page.totals.totalCredit)}
				/>
				<ReadOnlyField
					label="Variance"
					value={formatSalesJournalAmount(Math.abs(page.totals.variance))}
				/>
			</div>
			<div className="grid content-start gap-4">
				<SelectField
					label="Status"
					name="status"
					value={page.values.status}
					error={page.errors.status}
					disabled={page.isReadonly}
					options={SalesJournalStatusOptions}
					onChange={page.handleInputChange}
				/>
				<ReadOnlyField
					label="Balance"
					value={page.totals.isBalanced ? "Balanced" : "Needs balancing"}
				/>
			</div>
		</div>
	);
}

function SalesJournalReferencesSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	const firstLine = page.values.lines[0];

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid content-start gap-4">
				<TextField
					label="Trans No."
					name="documentNo"
					value={page.values.documentNo}
					error={page.errors.documentNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Document Date"
					name="documentDate"
					type="date"
					value={page.values.documentDate}
					error={page.errors.documentDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<label className="block">
					<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
						Ref No.
					</span>
					<input
						className={fieldClassName}
						disabled={page.isReadonly || !firstLine}
						onChange={(event) => {
							if (firstLine) {
								page.updateLine(firstLine.id, "refNo", event.target.value);
							}
						}}
						value={firstLine?.refNo ?? ""}
					/>
				</label>
				<ReadOnlyField label="ProjectRef." value="" />
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
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
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
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<input
				className={`${fieldClassName} bg-offwhite text-darknavy/70`}
				readOnly
				value={value}
			/>
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
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
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

type LineControlProps = {
	disabled: boolean;
	error?: string;
	onChange: (value: string) => void;
	value: string;
	type?: string;
	min?: string;
	step?: string;
};

function LineInput({
	disabled,
	error,
	onChange,
	value,
	type = "text",
	min,
	step,
}: LineControlProps) {
	return (
		<div className="min-w-[8rem]">
			<input
				className={fieldClassName}
				disabled={disabled}
				min={min}
				onChange={(event) => onChange(event.target.value)}
				step={step}
				type={type}
				value={value}
			/>
			{error ? <div className={errorClassName}>{error}</div> : null}
		</div>
	);
}

function LineSelect({
	disabled,
	onChange,
	options,
	value,
}: LineControlProps & { options: readonly string[] }) {
	return (
		<select
			className={`${fieldClassName} min-w-[9rem]`}
			disabled={disabled}
			onChange={(event) => onChange(event.target.value)}
			value={value}
		>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}
