import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function BillingInvoiceEntryTextInput({
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
}) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={billingInvoiceEntryCellControlClassName()}
		/>
	);
}

export function BillingInvoiceEntryAmountInput({
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
}) {
	return (
		<MoneyNumberField
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={billingInvoiceEntryCellControlClassName("text-right tabular-nums")}
		/>
	);
}

export function billingInvoiceEntryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

export function formatBillingInvoiceEntryAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(value);
}

export const BillingInvoiceEntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
