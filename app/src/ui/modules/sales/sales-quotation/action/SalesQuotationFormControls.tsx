import type { ReactNode } from "react";

export const SalesQuotationFieldClassName =
	"h-11 w-full min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";

export const SalesQuotationTextareaClassName =
	"min-h-24 w-full min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-offwhite/65 disabled:text-darknavy/65";

export type SalesQuotationFieldUpdater<TValues> = <Key extends keyof TValues>(
	key: Key,
	value: TValues[Key],
) => void;

export function SalesQuotationFormField({
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
			<span className="mb-2 block text-sm font-medium text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-2 block text-xs font-semibold text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

export function SalesQuotationFieldShell({
	children,
	controlId,
	isRequired = false,
	label,
}: {
	children: ReactNode;
	controlId: string;
	isRequired?: boolean;
	label: string;
}) {
	return (
		<div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
			<label
				htmlFor={controlId}
				className="pt-2 text-sm font-semibold text-darknavy"
			>
				{label}
				{isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
			</label>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

export function SalesQuotationTextField({
	id,
	isRequired = false,
	label,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<SalesQuotationFieldShell
			controlId={id}
			label={label}
			isRequired={isRequired}
		>
			<input
				id={id}
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={SalesQuotationFieldClassName}
			/>
		</SalesQuotationFieldShell>
	);
}

export function SalesQuotationDateField({
	id,
	isRequired = false,
	label,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<SalesQuotationFieldShell
			controlId={id}
			label={label}
			isRequired={isRequired}
		>
			<input
				id={id}
				type="date"
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={SalesQuotationFieldClassName}
			/>
		</SalesQuotationFieldShell>
	);
}

export function SalesQuotationSelectField({
	id,
	isRequired = false,
	label,
	onChange,
	options,
	readOnly,
	value,
}: {
	id: string;
	isRequired?: boolean;
	label: string;
	onChange: (value: string) => void;
	options: readonly string[];
	readOnly: boolean;
	value: string;
}) {
	return (
		<SalesQuotationFieldShell
			controlId={id}
			label={label}
			isRequired={isRequired}
		>
			<select
				id={id}
				value={value}
				disabled={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={SalesQuotationFieldClassName}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</SalesQuotationFieldShell>
	);
}

export function SalesQuotationAttachedTextField({
	id,
	isRequired = false,
	label,
	onAdd,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	isRequired?: boolean;
	label: string;
	onAdd: () => void;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<SalesQuotationFieldShell
			controlId={id}
			label={label}
			isRequired={isRequired}
		>
			<div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
				<input
					id={id}
					value={value}
					readOnly={readOnly}
					onChange={(event) => onChange(event.target.value)}
					className={`${SalesQuotationFieldClassName} sm:rounded-r-none`}
				/>
				<button
					type="button"
					disabled={readOnly}
					onClick={onAdd}
					className="inline-flex h-11 w-20 shrink-0 items-center justify-center rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none"
				>
					Add
				</button>
			</div>
		</SalesQuotationFieldShell>
	);
}

