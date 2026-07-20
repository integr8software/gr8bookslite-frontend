import {
	DeliveryReceiptBranchOptions,
	DeliveryReceiptCurrencyOptions,
	DeliveryReceiptPartyOptions,
	DeliveryReceiptTermOptions,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	AttachedDropdown,
	DateField,
	FieldClassName,
	FieldShell,
	SelectField,
	TextField,
	type DeliveryReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptFieldControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type DeliveryReceiptCustomerFieldsProps = {
	isReadonly: boolean;
	values: DeliveryReceiptFormValues;
	onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptCustomerFields({
	isReadonly,
	onUpdateField,
	values,
}: DeliveryReceiptCustomerFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 xl:grid-cols-2">
			<div className="grid min-w-0 content-start gap-3">
				<TextField
					id="delivery-receipt-vce-code"
					label="Party Code"
					isRequired
					readOnly={isReadonly}
					value={values.vceCode}
					onChange={(value) => onUpdateField("vceCode", value)}
				/>
				<FieldShell controlId="delivery-receipt-vce-name" label="Party Name" isRequired>
					<AttachedDropdown
						id="delivery-receipt-vce-name"
						value={values.vceName}
						readOnly={isReadonly}
						options={DeliveryReceiptPartyOptions}
						placeholder=""
						searchPlaceholder="Search Party Name"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("vceName", value)}
					/>
				</FieldShell>
				<TextField
					id="delivery-receipt-bill-to-code"
					label="Bill To Code"
					readOnly={isReadonly}
					value={values.billToCode}
					onChange={(value) => onUpdateField("billToCode", value)}
				/>
				<FieldShell controlId="delivery-receipt-bill-to-name" label="Bill To Name">
					<AttachedDropdown
						id="delivery-receipt-bill-to-name"
						value={values.billToName}
						readOnly={isReadonly}
						options={DeliveryReceiptPartyOptions}
						placeholder=""
						searchPlaceholder="Search bill to"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("billToName", value)}
					/>
				</FieldShell>
				<FieldShell controlId="delivery-receipt-currency" label="Currency">
					<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
						<SelectField
							value={values.currency}
							readOnly={isReadonly}
							options={DeliveryReceiptCurrencyOptions}
							placeholder="PHP"
							onChange={(value) => onUpdateField("currency", value)}
						/>
						<div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
							<label
								htmlFor="delivery-receipt-exchange-rate"
								className="text-sm font-semibold text-darknavy"
							>
								FX Rate:
							</label>
							<MoneyNumberField
								id="delivery-receipt-exchange-rate"
								value={values.exchangeRate}
								readOnly={isReadonly}
								onValueChange={(value) => onUpdateField("exchangeRate", value)}
								className={`${FieldClassName} text-right`}
							/>
						</div>
					</div>
				</FieldShell>
				<TextField
					id="delivery-receipt-address"
					label="Address"
					readOnly={isReadonly}
					value={values.address}
					onChange={(value) => onUpdateField("address", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-3">
				<FieldShell controlId="delivery-receipt-branch" label="Branch">
					<AttachedDropdown
						id="delivery-receipt-branch"
						value={values.branch}
						readOnly={isReadonly}
						options={DeliveryReceiptBranchOptions}
						placeholder="--Select Branch--"
						searchPlaceholder="Search branch"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("branch", value)}
					/>
				</FieldShell>
				<TextField
					id="delivery-receipt-contact-no"
					label="Contact No."
					readOnly={isReadonly}
					value={values.contactNo}
					onChange={(value) => onUpdateField("contactNo", value)}
				/>
				<FieldShell controlId="delivery-receipt-terms" label="Terms" isRequired>
					<AttachedDropdown
						id="delivery-receipt-terms"
						value={values.terms}
						readOnly={isReadonly}
						options={DeliveryReceiptTermOptions}
						placeholder="--Select Terms--"
						searchPlaceholder="Search terms"
						onAdd={() => undefined}
						onChange={(value) => onUpdateField("terms", value)}
					/>
				</FieldShell>
				<DateField
					id="delivery-receipt-due-date"
					label="Due Date"
					readOnly={isReadonly}
					value={values.dueDate}
					onChange={(value) => onUpdateField("dueDate", value)}
				/>
				<FieldShell controlId="delivery-receipt-remarks" label="Remarks">
					<AppLimitedTextarea
						id="delivery-receipt-remarks"
						value={values.remarks}
						maxLength={250}
						readOnly={isReadonly}
						className={`${FieldClassName} min-h-24 py-3`}
						counterMode="remaining"
						onChange={(event) => onUpdateField("remarks", event.target.value)}
					/>
				</FieldShell>
			</div>
		</div>
	);
}
