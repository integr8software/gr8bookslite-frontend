import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	AmountField,
	TextField,
	type ServiceInvoiceFieldUpdater,
} from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceFieldControls";

type ServiceInvoiceAmountPartnerFieldsProps = {
	isReadonly: boolean;
	onUpdateField: ServiceInvoiceFieldUpdater<ServiceInvoiceFormValues>;
	values: ServiceInvoiceFormValues;
};

export function ServiceInvoiceAmountPartnerFields({
	isReadonly,
	onUpdateField,
	values,
}: ServiceInvoiceAmountPartnerFieldsProps) {
	return (
		<div className="grid min-w-0 content-start gap-x-8 gap-y-6 lg:grid-cols-2">
			<div className="grid min-w-0 content-start gap-4">
				<div className="grid min-w-0 gap-3">
					<AmountField
						id="service-invoice-net-amount"
						label="Net Amount"
						value={values.netAmount}
						readOnly
					/>
					<AmountField
						id="service-invoice-vat-amount"
						label="VAT Amount"
						value={values.vatAmount}
						readOnly
					/>
					<AmountField
						id="service-invoice-wvat-amount"
						label="WVAT Amount"
						value={values.wvatAmount}
						readOnly
					/>
					<AmountField
						id="service-invoice-ewt-amount"
						label="EWT Amount"
						value={values.ewtAmount}
						readOnly
					/>
					<AmountField
						id="service-invoice-discount-amount"
						label="Discount Amount"
						value={values.discountAmount}
						readOnly
					/>
					<AmountField
						id="service-invoice-gross-amount"
						label="Gross Amount"
						value={values.grossAmount}
						readOnly
					/>
				</div>
				<div className="grid min-w-0 gap-3">
					<TextField
						id="service-invoice-resident-code"
						label="Res. Customer Code"
						value={values.residentCustomerCode}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("residentCustomerCode", value)}
					/>
					<TextField
						id="service-invoice-resident-name"
						label="Res. Customer"
						value={values.residentCustomerName}
						readOnly={isReadonly}
						onChange={(value) => onUpdateField("residentCustomerName", value)}
					/>
				</div>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<TextField
					id="service-invoice-sales-associate"
					label="Sales Associate"
					value={values.salesAssociate}
					readOnly={isReadonly}
					onChange={(value) => onUpdateField("salesAssociate", value)}
				/>
				<div className="grid min-w-0 gap-3">
					<AmountField
						id="service-invoice-recoupment"
						label="Recoupment"
						value={values.recoupment}
						readOnly={isReadonly}
						onValueChange={(value) => onUpdateField("recoupment", value)}
					/>
					<AmountField
						id="service-invoice-donation"
						label="Donation"
						value={values.donation}
						readOnly={isReadonly}
						onValueChange={(value) => onUpdateField("donation", value)}
					/>
				</div>
				<TextField
					id="service-invoice-partner-code"
					label="Partner's Client Code"
					value={values.partnersClientCode}
					readOnly={isReadonly}
					onChange={(value) => onUpdateField("partnersClientCode", value)}
				/>
				<TextField
					id="service-invoice-partner-name"
					label="Partner's Client Name"
					value={values.partnersClientName}
					readOnly={isReadonly}
					onChange={(value) => onUpdateField("partnersClientName", value)}
				/>
			</div>
		</div>
	);
}
