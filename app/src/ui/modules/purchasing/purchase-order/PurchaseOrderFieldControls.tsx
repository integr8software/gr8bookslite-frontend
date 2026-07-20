import type { ReactNode } from "react";

export type PurchaseOrderFieldUpdater<TValues> = <Key extends keyof TValues>(
	key: Key,
	value: TValues[Key],
) => void;

export const PurchaseOrderFieldClassName =
	"app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export function FieldShell({
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

export function TextField({
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
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<input
				id={id}
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={PurchaseOrderFieldClassName}
			/>
		</FieldShell>
	);
}

export function DateField({
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
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<input
				id={id}
				type="date"
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={PurchaseOrderFieldClassName}
			/>
		</FieldShell>
	);
}

export function SelectField({
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
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<select
				id={id}
				value={value}
				disabled={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={PurchaseOrderFieldClassName}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</FieldShell>
	);
}

export function AmountField({
	id,
	label,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	label: string;
	onChange?: (value: number) => void;
	readOnly: boolean;
	value: number | string;
}) {
	return (
		<FieldShell controlId={id} label={label}>
			<input
				id={id}
				type="number"
				value={value}
				readOnly={readOnly || !onChange}
				onChange={(event) => onChange?.(Number(event.target.value))}
				className={`${PurchaseOrderFieldClassName} text-right tabular-nums`}
			/>
		</FieldShell>
	);
}

export function CheckboxField({
	id,
	label,
	onChange,
	readOnly,
	checked,
}: {
	id: string;
	label: string;
	onChange: (value: boolean) => void;
	readOnly: boolean;
	checked: boolean;
}) {
	return (
		<FieldShell controlId={id} label={label}>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				disabled={readOnly}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-3 h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/25"
			/>
		</FieldShell>
	);
}

export function AttachedTextField({
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
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
				<input
					id={id}
					value={value}
					readOnly={readOnly}
					onChange={(event) => onChange(event.target.value)}
					className={`${PurchaseOrderFieldClassName} sm:rounded-r-none`}
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
		</FieldShell>
	);
}
