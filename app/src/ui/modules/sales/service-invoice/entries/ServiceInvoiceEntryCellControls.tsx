import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ServiceInvoiceEntryTextInput({
	isInvalid = false,
	id,
	name,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
	isInvalid?: boolean;
}) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={serviceInvoiceEntryCellControlClassName(undefined, isInvalid)}
		/>
	);
}

export function ServiceInvoiceEntryAmountInput({
	isInvalid = false,
	id,
	name,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
	isInvalid?: boolean;
}) {
	return (
		<MoneyNumberField
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={serviceInvoiceEntryCellControlClassName(
				"text-right tabular-nums",
				isInvalid,
			)}
		/>
	);
}

export function serviceInvoiceEntryCellControlClassName(
	extraClassName?: string,
	isInvalid = false,
) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		isInvalid
			? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50 focus:bg-coralpink/10 focus:ring-coralpink/60"
			: "",
		extraClassName,
	);
}
