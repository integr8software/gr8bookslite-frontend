import {
	BillingInvoiceCurrencyOptions,
	BillingInvoicePartyOptions,
	BillingInvoiceResponsibilityCenterOptions,
	BillingInvoiceTermOptions,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type { BillingInvoiceFormValues } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	AmountField,
	FieldClassName,
	FieldShell,
	SelectField,
	TextField,
	type BillingInvoiceFieldUpdater,
} from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceFieldControls";

type BillingInvoiceDetailsFormProps = {
	isReadonly: boolean;
	values: BillingInvoiceFormValues;
	onUpdateField: BillingInvoiceFieldUpdater<BillingInvoiceFormValues>;
};

export function BillingInvoiceDetailsForm({
	isReadonly,
	onUpdateField,
	values,
}: BillingInvoiceDetailsFormProps) {
	return (
		<section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
			<div className="grid min-w-0 gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,0.65fr)]">
				<div className="grid min-w-0 content-start gap-3">
					<FieldShell controlId="billing-invoice-party-name" label="Party Name" isRequired>
						<AppAdvancedDropdown
							id="billing-invoice-party-name"
							value={values.name}
							readOnly={isReadonly}
							options={BillingInvoicePartyOptions}
							placeholder=""
							searchPlaceholder="Search party"
							onChange={(value) => onUpdateField("name", String(value))}
						/>
					</FieldShell>
					<TextField
						id="billing-invoice-bill-to-name"
						label="Bill to Name"
						value={values.billToName}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("billToName", value)}
					/>
					<TextField
						id="billing-invoice-address"
						label="Address"
						value={values.address}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("address", value)}
					/>
					<TextField
						id="billing-invoice-contact-person"
						label="Contact Person"
						value={values.contactPerson}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("contactPerson", value)}
					/>
					<TextField
						id="billing-invoice-contact-no"
						label="Contact No"
						value={values.contactNo}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("contactNo", value)}
					/>
					<TextField
						id="billing-invoice-project-name"
						label="Project Name"
						value={values.projectName}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("projectName", value)}
					/>
					<FieldShell controlId="billing-invoice-remarks" label="Remarks">
						<AppLimitedTextarea
							id="billing-invoice-remarks"
							value={values.remarks}
							readOnly={isReadonly}
							onChange={(event) => onUpdateField("remarks", event.target.value)}
							className={`${FieldClassName} min-h-20 py-3`}
							counterMode="remaining"
							maxLength={250}
						/>
					</FieldShell>
				</div>

				<div className="grid min-w-0 content-start gap-3">
					<TextField
						id="billing-invoice-party-code"
						label="Party Code"
						value={values.code}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("code", value)}
					/>
					<TextField
						id="billing-invoice-bill-to-code"
						label="Bill to Code"
						value={values.billToCode}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("billToCode", value)}
					/>
					<FieldShell controlId="billing-invoice-terms" label="Terms of Pyt">
						<SelectField
							value={values.terms}
							readOnly={isReadonly}
							options={BillingInvoiceTermOptions}
							placeholder="--Select Terms--"
							onChange={(value) => onUpdateField("terms", value)}
						/>
					</FieldShell>
					<DateField
						id="billing-invoice-due-date"
						label="Due Date"
						value={values.dueDate}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("dueDate", value)}
					/>
					<FieldShell controlId="billing-invoice-currency" label="Currency">
						<SelectField
							value={values.currency}
							readOnly={isReadonly}
							options={BillingInvoiceCurrencyOptions}
							placeholder="Currency"
							onChange={(value) => onUpdateField("currency", value)}
						/>
					</FieldShell>
					<AmountField
						id="billing-invoice-exchange-rate"
						label="ER"
						value={values.exchangeRate}
						readOnly={isReadonly}
						onValueChange={(value) => onUpdateField("exchangeRate", value)}
					/>
					<FieldShell controlId="billing-invoice-res-center" label="Res Center">
						<SelectField
							value={values.resCenter}
							readOnly={isReadonly}
							options={BillingInvoiceResponsibilityCenterOptions}
							placeholder="--Select Res. Center--"
							onChange={(value) => onUpdateField("resCenter", value)}
						/>
					</FieldShell>
				</div>

				<div className="grid min-w-0 content-start gap-3">
					<TextField
						id="billing-invoice-transaction-no"
						label="BI No"
						value={values.transactionNo}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("transactionNo", value)}
					/>
					<DateField
						id="billing-invoice-document-date"
						label="BI Date"
						value={values.documentDate}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("documentDate", value)}
					/>
					<TextField
						id="billing-invoice-dr-no"
						label="DR No."
						value={values.drNo}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("drNo", value)}
					/>
					<TextField
						id="billing-invoice-sales-personnel"
						label="Sales Personnel"
						value={values.salesAssociate}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("salesAssociate", value)}
					/>
				</div>
			</div>
		</section>
	);
}

function DateField({
	id,
	label,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	label: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<FieldShell controlId={id} label={label}>
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
