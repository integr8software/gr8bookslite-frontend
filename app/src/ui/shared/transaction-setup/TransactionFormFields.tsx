import type { InputHTMLAttributes, ReactNode } from "react";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export const TransactionFieldClassName = [
	"app-data-entry-field h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3",
	"text-sm text-darknavy outline-none transition focus:border-skyblue",
	"placeholder:text-darknavy/35 focus:ring-2 focus:ring-skyblue/20",
].join(" ");

export type TransactionFieldProps = {
	children: ReactNode;
	error?: string;
	isRequired?: boolean;
	label: string;
};

export function TransactionField({
	children,
	error,
	isRequired = false,
	label,
}: TransactionFieldProps) {
	return (
		<label className="grid min-w-0 gap-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
			<span className="pt-2 text-sm font-semibold text-darknavy/70">
				{label}
				{isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
			</span>
			<span className="block min-w-0">
				{children}
				{error ? <span className="mt-1.5 block text-xs font-semibold text-red-500">{error}</span> : null}
			</span>
		</label>
	);
}

export type TransactionTextFieldProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"className" | "onChange" | "readOnly" | "value"
> & {
	error?: string;
	isMoney?: boolean;
	isReadonly?: boolean;
	isRequired?: boolean;
	label: string;
	onValueChange: (value: string) => void;
	value: string;
};

export function TransactionTextField({
	error,
	isMoney = false,
	isReadonly = false,
	isRequired = false,
	label,
	onValueChange,
	placeholder,
	type = "text",
	value,
	...inputProps
}: TransactionTextFieldProps) {
	const className = [
		TransactionFieldClassName,
		isMoney ? "text-right tabular-nums" : "",
		isReadonly ? "transaction-readonly-placeholder" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<TransactionField label={label} error={error} isRequired={isRequired}>
			{isMoney ? (
				<MoneyNumberField
					{...inputProps}
					value={value}
					readOnly={isReadonly}
					onValueChange={onValueChange}
					className={className}
					placeholder={placeholder}
				/>
			) : (
				<input
					{...inputProps}
					type={type}
					value={value}
					readOnly={isReadonly}
					onChange={(event) => onValueChange(event.target.value)}
					className={className}
					placeholder={placeholder}
				/>
			)}
		</TransactionField>
	);
}
