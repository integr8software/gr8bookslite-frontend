import type { ReactNode } from "react";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type DeliveryReceiptFieldUpdater<TValues> = <Key extends keyof TValues>(
	key: Key,
	value: TValues[Key],
) => void;

export function TextField({
	id,
	label,
	onChange,
	readOnly,
	value,
	isRequired = false,
}: {
	id: string;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
	isRequired?: boolean;
}) {
	return (
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<input
				id={id}
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={FieldClassName}
			/>
		</FieldShell>
	);
}

export function DateField({
	id,
	label,
	onChange,
	readOnly,
	value,
	isRequired = false,
}: {
	id: string;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
	isRequired?: boolean;
}) {
	return (
		<FieldShell controlId={id} label={label} isRequired={isRequired}>
			<input
				id={id}
				type="date"
				value={value}
				readOnly={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={FieldClassName}
			/>
		</FieldShell>
	);
}

export function AmountField({
	id,
	label,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	label: string;
	onValueChange?: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<FieldShell controlId={id} label={label}>
			<MoneyNumberField
				id={id}
				value={value}
				readOnly={readOnly}
				onValueChange={onValueChange ?? (() => undefined)}
				className={`${FieldClassName} text-right tabular-nums`}
			/>
		</FieldShell>
	);
}

export function SelectField({
	onChange,
	options,
	placeholder,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	readOnly: boolean;
	value: string;
}) {
	return (
		<AppAdvancedDropdown
			value={value}
			readOnly={readOnly}
			options={options}
			placeholder={placeholder}
			onChange={(nextValue) => onChange(String(nextValue))}
		/>
	);
}

export function AttachedDropdown({
	id,
	onAdd,
	onChange,
	options,
	placeholder,
	readOnly,
	searchPlaceholder,
	value,
}: {
	id: string;
	onAdd: () => void;
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	placeholder: string;
	readOnly: boolean;
	searchPlaceholder: string;
	value: string;
}) {
	return (
		<div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
			<AppAdvancedDropdown
				className={AttachedDropdownClassName}
				id={id}
				value={value}
				readOnly={readOnly}
				options={options}
				placeholder={placeholder}
				searchPlaceholder={searchPlaceholder}
				onChange={(nextValue) => onChange(String(nextValue))}
			/>
			<button
				type="button"
				disabled={readOnly}
				onClick={onAdd}
				className={AttachedAddButtonClassName}
			>
				Add
			</button>
		</div>
	);
}

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
		<div className="grid min-w-0 gap-2 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start">
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

export const FieldClassName =
	"app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

const AttachedDropdownClassName =
	"sm:[&_.app-advanced-dropdown-control]:rounded-r-none";

const AttachedAddButtonClassName = joinClasses(
	"inline-flex h-11 w-20 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none",
);
