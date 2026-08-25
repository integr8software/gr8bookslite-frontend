import {
	SalesQuotationCurrencyOptions,
	SalesQuotationStatusOptions,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import type { SalesQuotationStatus } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import type { SalesQuotationServicesFormValues } from "@/app/src/types/modules/sales/sales-quotation-services/SalesQuotationServicesTypes";
import {
	SalesQuotationAttachedTextField,
	SalesQuotationDateField,
	SalesQuotationFieldClassName,
	SalesQuotationFieldShell,
	SalesQuotationSelectField,
	SalesQuotationTextField,
} from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationFieldControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type Props = {
	isReadonly: boolean;
	values: SalesQuotationServicesFormValues;
	onUpdateField: <Key extends keyof SalesQuotationServicesFormValues>(
		key: Key,
		value: SalesQuotationServicesFormValues[Key],
	) => void;
};

export function SalesQuotationServicesDetailsForm({ isReadonly, onUpdateField, values }: Props) {
	return <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
		<div className="grid min-w-0 gap-5 xl:grid-cols-3">
			<div className="grid min-w-0 content-start gap-4">
				<SalesQuotationAttachedTextField id="sales-quotation-services-party-name" label="Party Name" isRequired readOnly={isReadonly} value={values.partyName} onAdd={() => undefined} onChange={(value) => onUpdateField("partyName", value)} />
				<SalesQuotationTextField id="sales-quotation-services-contact-person" label="Contact Person" readOnly={isReadonly} value={values.contactPerson} onChange={(value) => onUpdateField("contactPerson", value)} />
				<SalesQuotationTextField id="sales-quotation-services-contact-no" label="Contact No." readOnly={isReadonly} value={values.contactNo} onChange={(value) => onUpdateField("contactNo", value)} />
				<SalesQuotationFieldShell controlId="sales-quotation-services-party-address" label="Party Address"><textarea id="sales-quotation-services-party-address" readOnly={isReadonly} value={values.partyAddress} onChange={(event) => onUpdateField("partyAddress", event.target.value)} className={`${SalesQuotationFieldClassName} min-h-20 py-3`} /></SalesQuotationFieldShell>
				<SalesQuotationFieldShell controlId="sales-quotation-services-remarks" label="Remarks"><AppLimitedTextarea id="sales-quotation-services-remarks" readOnly={isReadonly} value={values.remarks} onChange={(event) => onUpdateField("remarks", event.target.value)} className={`${SalesQuotationFieldClassName} min-h-20 py-3`} counterMode="remaining" maxLength={250} /></SalesQuotationFieldShell>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<SalesQuotationTextField id="sales-quotation-services-party-code" label="Party Code" isRequired readOnly={isReadonly} value={values.partyCode} onChange={(value) => onUpdateField("partyCode", value)} />
				<SalesQuotationSelectField id="sales-quotation-services-currency" label="Currency" readOnly={isReadonly} value={values.currency} options={SalesQuotationCurrencyOptions} onChange={(value) => onUpdateField("currency", value)} />
				<SalesQuotationFieldShell controlId="sales-quotation-services-exchange-rate" label="Exchange Rate"><input id="sales-quotation-services-exchange-rate" type="number" readOnly={isReadonly} value={values.exchangeRate} onChange={(event) => onUpdateField("exchangeRate", Number(event.target.value))} className={`${SalesQuotationFieldClassName} text-right`} /></SalesQuotationFieldShell>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<SalesQuotationTextField id="sales-quotation-services-trans-no" label="SQ No." isRequired readOnly={isReadonly} value={values.transNo} onChange={(value) => onUpdateField("transNo", value)} />
				<SalesQuotationDateField id="sales-quotation-services-document-date" label="SQ Date" readOnly={isReadonly} value={values.prDate} onChange={(value) => onUpdateField("prDate", value)} />
				<SalesQuotationTextField id="sales-quotation-services-reference-no" label="Reference No." readOnly={isReadonly} value={values.referenceNo} onChange={(value) => onUpdateField("referenceNo", value)} />
				<SalesQuotationSelectField id="sales-quotation-services-status" label="Status" readOnly={isReadonly} value={values.status} options={SalesQuotationStatusOptions} onChange={(value) => onUpdateField("status", value as SalesQuotationStatus)} />
			</div>
		</div>
	</section>;
}
