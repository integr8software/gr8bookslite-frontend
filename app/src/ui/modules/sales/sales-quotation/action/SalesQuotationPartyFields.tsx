import {
	SalesQuotationCurrencyOptions,
	SalesQuotationStatusOptions,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import {
	formatSalesQuotationCurrency,
	getSalesQuotationTotals,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type {
	SalesQuotationFormValues,
	SalesQuotationStatus,
} from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import {
	SalesQuotationAttachedTextField,
	SalesQuotationDateField,
	SalesQuotationFieldClassName,
	SalesQuotationFieldShell,
	SalesQuotationSelectField,
	SalesQuotationTextField,
	type SalesQuotationFieldUpdater,
} from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationFormControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type SalesQuotationPartyFieldsProps = {
	isReadonly: boolean;
	values: SalesQuotationFormValues;
	onUpdateField: SalesQuotationFieldUpdater<SalesQuotationFormValues>;
};

export function SalesQuotationPartyFields({
	isReadonly,
	onUpdateField,
	values,
}: SalesQuotationPartyFieldsProps) {
	const totals = getSalesQuotationTotals({ items: values.items });

	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-3">
			<div className="grid min-w-0 gap-4">
				<div className="grid min-w-0 gap-4 sm:grid-cols-2">
					<SalesQuotationSelectField
						id="sales-quotation-currency"
						label="Currency"
						readOnly={isReadonly}
						value={values.currency}
						options={SalesQuotationCurrencyOptions}
						onChange={(value) => onUpdateField("currency", value)}
					/>
					<SalesQuotationFieldShell
						controlId="sales-quotation-exchange-rate"
						label="Exchange Rate"
					>
						<input
							id="sales-quotation-exchange-rate"
							type="number"
							readOnly={isReadonly}
							value={values.exchangeRate}
							onChange={(event) =>
								onUpdateField("exchangeRate", Number(event.target.value))
							}
							className={`${SalesQuotationFieldClassName} text-right`}
						/>
					</SalesQuotationFieldShell>
				</div>
				<SalesQuotationTextField
					id="sales-quotation-vce-code"
					label="Party Code"
					isRequired
					readOnly={isReadonly}
					value={values.partyCode}
					onChange={(value) => onUpdateField("partyCode", value)}
				/>
				<SalesQuotationAttachedTextField
					id="sales-quotation-vce-name"
					label="Party Name"
					isRequired
					readOnly={isReadonly}
					value={values.partyName}
					onAdd={() => undefined}
					onChange={(value) => onUpdateField("partyName", value)}
				/>
				<SalesQuotationFieldShell
					controlId="sales-quotation-party-address"
					label="Party Address"
				>
					<textarea
						id="sales-quotation-party-address"
						readOnly={isReadonly}
						value={values.partyAddress}
						onChange={(event) =>
							onUpdateField("partyAddress", event.target.value)
						}
						className={`${SalesQuotationFieldClassName} min-h-20 py-3`}
					/>
				</SalesQuotationFieldShell>
				<SalesQuotationFieldShell
					controlId="sales-quotation-remarks"
					label="Remarks"
				>
					<AppLimitedTextarea
						id="sales-quotation-remarks"
						readOnly={isReadonly}
						value={values.remarks}
						onChange={(event) =>
							onUpdateField("remarks", event.target.value)
						}
						className={`${SalesQuotationFieldClassName} min-h-20 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</SalesQuotationFieldShell>
			</div>
			<div className="grid content-start gap-4">
				<SalesQuotationAmountField
					id="sales-quotation-gross-amount"
					label="Gross Amount"
					value={totals.grossAmount}
				/>
				<SalesQuotationAmountField
					id="sales-quotation-vat-amount"
					label="VAT Amount"
					value={totals.vatAmount}
				/>
				<SalesQuotationAmountField
					id="sales-quotation-ewt-amount"
					label="EWT Amount"
					value={totals.ewtAmount}
				/>
				<SalesQuotationAmountField
					id="sales-quotation-discount-amount"
					label="Discount Amount"
					value={totals.discountAmount}
				/>
				<SalesQuotationAmountField
					id="sales-quotation-net-amount"
					label="Net Amount"
					value={totals.netAmount}
				/>
			</div>
			<div className="grid content-start gap-4">
				<SalesQuotationTextField
					id="sales-quotation-trans-no"
					label="Transaction Number"
					isRequired
					readOnly={isReadonly}
					value={values.transNo}
					onChange={(value) => onUpdateField("transNo", value)}
				/>
				<SalesQuotationDateField
					id="sales-quotation-document-date"
					label="Document Date"
					readOnly={isReadonly}
					value={values.prDate}
					onChange={(value) => onUpdateField("prDate", value)}
				/>
				<SalesQuotationSelectField
					id="sales-quotation-status"
					label="Status"
					readOnly
					value={values.status}
					options={SalesQuotationStatusOptions}
					onChange={(value) =>
						onUpdateField("status", value as SalesQuotationStatus)
					}
				/>
			</div>
		</div>
	);
}

function SalesQuotationAmountField({
	id,
	label,
	value,
}: {
	id: string;
	label: string;
	value: number;
}) {
	return (
		<SalesQuotationFieldShell controlId={id} label={label}>
			<input
				id={id}
				readOnly
				value={formatSalesQuotationCurrency(value)}
				className={`${SalesQuotationFieldClassName} text-right`}
			/>
		</SalesQuotationFieldShell>
	);
}
