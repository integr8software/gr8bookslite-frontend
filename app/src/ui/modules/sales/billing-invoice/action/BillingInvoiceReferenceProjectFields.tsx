import type {
	BillingInvoiceFieldUpdater,
	BillingInvoiceFormValues,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	FieldClassName,
	FieldShell,
	TextField,
} from "@/app/src/ui/modules/sales/billing-invoice/action/BillingInvoiceFieldControls";

type BillingInvoiceReferenceProjectFieldsProps = {
	isReadonly: boolean;
	onUpdateField: BillingInvoiceFieldUpdater<BillingInvoiceFormValues>;
	values: BillingInvoiceFormValues;
};

export function BillingInvoiceReferenceProjectFields({
	isReadonly,
	onUpdateField,
	values,
}: BillingInvoiceReferenceProjectFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 lg:grid-cols-2">
			<FieldShell
				controlId="billing-invoice-transaction-no"
				label="SO No."
				isRequired
			>
				<input
					id="billing-invoice-transaction-no"
					value={values.soNo}
					readOnly={isReadonly}
					onChange={(event) =>
						onUpdateField("soNo", event.target.value)
					}
					className={FieldClassName}
				/>
			</FieldShell>
			<FieldShell
				controlId="billing-invoice-document-date"
				label="Document Date"
			>
				<input
					id="billing-invoice-document-date"
					type="date"
					value={values.documentDate}
					readOnly={isReadonly}
					onChange={(event) => onUpdateField("documentDate", event.target.value)}
					className={FieldClassName}
				/>
			</FieldShell>
			<TextField
				id="billing-invoice-sj-no"
				label="SJ No."
				value={values.sjNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("sjNo", value)}
			/>
			<TextField
				id="billing-invoice-po-no"
				label="PO No."
				value={values.poNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("poNo", value)}
			/>
			<TextField
				id="billing-invoice-invoice-no"
				label="Invoice No."
				value={values.invoiceNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("invoiceNo", value)}
			/>
			<TextField
				id="billing-invoice-ref-no"
				label="Ref No."
				value={values.referenceNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("referenceNo", value)}
			/>
			<TextField
				id="billing-invoice-business-style"
				label="Bus. Style"
				value={values.businessStyle}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("businessStyle", value)}
			/>
			<TextField
				id="billing-invoice-status"
				label="Status"
				value={values.status}
				readOnly
				onChange={() => undefined}
			/>
			<TextField
				id="billing-invoice-project-ref"
				label="Project Code"
				value={values.projectRef}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("projectRef", value)}
			/>
			<TextField
				id="billing-invoice-project-name"
				label="Project Name"
				value={values.projectName}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("projectName", value)}
			/>
			<TextField
				id="billing-invoice-our-reference"
				label="Our Reference"
				value={values.ourReference}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("ourReference", value)}
			/>
			<TextField
				id="billing-invoice-client-reference"
				label="Client Reference"
				value={values.clientReference}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("clientReference", value)}
			/>
			<FieldShell controlId="billing-invoice-entry-date" label="Entry Date">
				<input
					id="billing-invoice-entry-date"
					type="date"
					value={values.entryDate}
					readOnly={isReadonly}
					onChange={(event) => onUpdateField("entryDate", event.target.value)}
					className={FieldClassName}
				/>
			</FieldShell>
			<TextField
				id="billing-invoice-shipper-consignee"
				label="Shipper/Consignee"
				value={values.shipperConsignee}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("shipperConsignee", value)}
			/>
			<TextField
				id="billing-invoice-entry-number"
				label="Entry Number"
				value={values.entryNumber}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("entryNumber", value)}
			/>
			<TextField
				id="billing-invoice-mawb-no"
				label="MAWB No."
				value={values.mawbNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("mawbNo", value)}
			/>
			<TextField
				id="billing-invoice-bl-hawb-no"
				label="B/L HAWB No."
				value={values.blHawbNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("blHawbNo", value)}
			/>
			<TextField
				id="billing-invoice-carrier-flight"
				label="Carrier/flight"
				value={values.carrierFlight}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("carrierFlight", value)}
			/>
			<FieldShell controlId="billing-invoice-ets-etd" label="ETS/ETD">
				<input
					id="billing-invoice-ets-etd"
					type="date"
					value={values.etsEtd}
					readOnly={isReadonly}
					onChange={(event) => onUpdateField("etsEtd", event.target.value)}
					className={FieldClassName}
				/>
			</FieldShell>
			<FieldShell controlId="billing-invoice-eta" label="ETA">
				<input
					id="billing-invoice-eta"
					type="date"
					value={values.eta}
					readOnly={isReadonly}
					onChange={(event) => onUpdateField("eta", event.target.value)}
					className={FieldClassName}
				/>
			</FieldShell>
			<TextField
				id="billing-invoice-origin-port"
				label="Origin Port"
				value={values.originPort}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("originPort", value)}
			/>
		</div>
	);
}

