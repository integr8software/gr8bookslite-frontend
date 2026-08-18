import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function BillingEntryTextInput({
	id,
	isInvalid = false,
	name,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	isInvalid?: boolean;
	name: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={billingEntryCellControlClassName(
				isInvalid ? "bg-red-50/70 ring-1 ring-inset ring-red-300" : "",
			)}
		/>
	);
}

export function BillingEntryAmountInput({
	id,
	isInvalid = false,
	name,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	isInvalid?: boolean;
	name: string;
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={billingEntryCellControlClassName(
				joinClasses(
					"text-right tabular-nums",
					isInvalid ? "bg-red-50/70 ring-1 ring-inset ring-red-300" : "",
				),
			)}
		/>
	);
}

export function billingEntryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}
