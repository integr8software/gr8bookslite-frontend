import type { ReactNode } from "react";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export type CanvassFormFieldUpdater<TValues> = <Key extends keyof TValues>(
	key: Key,
	value: TValues[Key],
) => void;

export const FieldClassName =
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
			<label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
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
				value={value ?? ""}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={FieldClassName}
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
				value={value ?? ""}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={FieldClassName}
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
			<AppAdvancedDropdown
				id={id}
				value={value ?? ""}
				readOnly={readOnly}
				options={options.map((option) => ({ name: option, value: option }))}
				placeholder="--Select Option--"
				onChange={(nextValue) => onChange(String(nextValue))}
			/>
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
	onChange: (value: number) => void;
	readOnly: boolean;
	value: number;
}) {
	return (
		<FieldShell controlId={id} label={label}>
			<input
				id={id}
				type="number"
				step="0.01"
				value={value ?? ""}
				readOnly={readOnly}
				onChange={(event) =>
					onChange(Math.round(Number(event.target.value || 0) * 100) / 100)
				}
				className={`${FieldClassName} text-right tabular-nums`}
			/>
		</FieldShell>
	);
}
