import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	FieldClassName,
	FieldShell,
	TextField,
	type ServiceInvoiceFieldUpdater,
} from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceFieldControls";

type ServiceInvoiceReferenceProjectFieldsProps = {
	isReadonly: boolean;
	onUpdateField: ServiceInvoiceFieldUpdater<ServiceInvoiceFormValues>;
	values: ServiceInvoiceFormValues;
};

export function ServiceInvoiceReferenceProjectFields({
	isReadonly,
	onUpdateField,
	values,
}: ServiceInvoiceReferenceProjectFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-3 lg:grid-cols-2">
			<TextField
				id="service-invoice-transaction-no"
				label="Trans No."
				value={values.transactionNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("transactionNo", value)}
			/>
			<FieldShell
				controlId="service-invoice-document-date"
				label="Document Date"
				isRequired
			>
				<input
					id="service-invoice-document-date"
					type="date"
					value={values.documentDate}
					readOnly={isReadonly}
					onChange={(event) => onUpdateField("documentDate", event.target.value)}
					className={FieldClassName}
				/>
			</FieldShell>
			<TextField
				id="service-invoice-sj-no"
				label="SJ No."
				value={values.sjNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("sjNo", value)}
			/>
			<TextField
				id="service-invoice-jo-no"
				label="JO No."
				value={values.joNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("joNo", value)}
			/>
			<TextField
				id="service-invoice-po-no"
				label="PO No."
				value={values.poNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("poNo", value)}
			/>
			<TextField
				id="service-invoice-invoice-no"
				label="Invoice No."
				value={values.invoiceNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("invoiceNo", value)}
			/>
			<TextField
				id="service-invoice-ref-no"
				label="Ref No."
				value={values.referenceNo}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("referenceNo", value)}
			/>
			<TextField
				id="service-invoice-business-style"
				label="Bus. Style"
				value={values.businessStyle}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("businessStyle", value)}
			/>
			<TextField
				id="service-invoice-status"
				label="Status"
				value={values.status}
				readOnly
				onChange={() => undefined}
			/>
			<TextField
				id="service-invoice-project-ref"
				label="ProjectRef"
				value={values.projectRef}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("projectRef", value)}
			/>
			<TextField
				id="service-invoice-project-name"
				label="Project Name"
				value={values.projectName}
				readOnly={isReadonly}
				onChange={(value) => onUpdateField("projectName", value)}
			/>
		</div>
	);
}
