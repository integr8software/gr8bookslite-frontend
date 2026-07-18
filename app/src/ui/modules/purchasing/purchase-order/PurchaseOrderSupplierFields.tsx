import {
	PurchaseOrderBooleanOptions,
	PurchaseOrderCurrencyOptions,
	PurchaseOrderTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
	formatPurchaseOrderAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderFormValues } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	AmountField,
	AttachedTextField,
	DateField,
	FieldShell,
	PurchaseOrderFieldClassName,
	SelectField,
	TextField,
	type PurchaseOrderFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-order/PurchaseOrderFieldControls";

type PurchaseOrderSupplierFieldsProps = {
	isReadonly: boolean;
	values: PurchaseOrderFormValues;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderSupplierFields({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseOrderSupplierFieldsProps) {
	const totals = getPurchaseOrderTotals(values);

	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<BooleanSelectField
					id="purchase-order-partial-payment"
					label="Partial Payment"
					readOnly={isReadonly}
					value={values.partialPayment ? "True" : "False"}
					onChange={(value) =>
						onUpdateField("partialPayment", value === "True")
					}
				/>
				<BooleanSelectField
					id="purchase-order-fixed-asset"
					label="Fixed Asset"
					readOnly={isReadonly}
					value={values.fixedAsset ? "True" : "False"}
					onChange={(value) => onUpdateField("fixedAsset", value === "True")}
				/>
			</div>
			<SelectField
				id="purchase-order-purchase-type"
				label="Purchase Type"
				readOnly={isReadonly}
				value={values.purchaseType}
				options={PurchaseOrderTypeOptions}
				onChange={(value) => onUpdateField("purchaseType", value)}
			/>
			<TextField
				id="purchase-order-vce-code"
				label="VCE Code"
				readOnly={isReadonly}
				value={values.vceCode}
				onChange={(value) => onUpdateField("vceCode", value)}
			/>
			<AmountField
				id="purchase-order-gross-amount"
				label="Gross Amount"
				readOnly
				value={formatPurchaseOrderAmount(totals.grossAmount)}
			/>
			<AttachedTextField
				id="purchase-order-vce-name"
				label="VCE Name"
				readOnly={isReadonly}
				value={values.vceName}
				onAdd={() => undefined}
				onChange={(value) => onUpdateField("vceName", value)}
			/>
			<AmountField
				id="purchase-order-discount-amount"
				label="Discount Amount"
				readOnly={isReadonly}
				value={values.discountAmount}
				onChange={(value) => onUpdateField("discountAmount", value)}
			/>
			<div className="grid min-w-0 gap-4 sm:grid-cols-2">
				<SelectField
					id="purchase-order-currency"
					label="Currency"
					readOnly={isReadonly}
					value={values.currency}
					options={PurchaseOrderCurrencyOptions}
					onChange={(value) => onUpdateField("currency", value)}
				/>
				<AmountField
					id="purchase-order-exchange-rate"
					label="Exchange Rate"
					readOnly={isReadonly}
					value={values.exchangeRate}
					onChange={(value) => onUpdateField("exchangeRate", value)}
				/>
			</div>
			<AmountField
				id="purchase-order-vat-amount"
				label="VAT Amount"
				readOnly={isReadonly}
				value={values.vatAmount}
				onChange={(value) => onUpdateField("vatAmount", value)}
			/>
			<TextField
				id="purchase-order-address"
				label="Address"
				readOnly={isReadonly}
				value={values.address}
				onChange={(value) => onUpdateField("address", value)}
			/>
			<AmountField
				id="purchase-order-net-amount"
				label="Net Amount"
				readOnly
				value={formatPurchaseOrderAmount(totals.netAmount)}
			/>
			<TextField
				id="purchase-order-contact-no"
				label="Contact No."
				readOnly={isReadonly}
				value={values.contactNo}
				onChange={(value) => onUpdateField("contactNo", value)}
			/>
			<TextField
				id="purchase-order-email-address"
				label="Email Address"
				readOnly={isReadonly}
				value={values.emailAddress}
				onChange={(value) => onUpdateField("emailAddress", value)}
			/>
			<DateField
				id="purchase-order-delivery-date"
				label="Delivery Date"
				readOnly={isReadonly}
				value={values.deliveryDate}
				onChange={(value) => onUpdateField("deliveryDate", value)}
			/>
			<div className="xl:col-span-2">
				<FieldShell controlId="purchase-order-remarks" label="Remarks">
					<AppLimitedTextarea
						id="purchase-order-remarks"
						readOnly={isReadonly}
						value={values.remarks}
						onChange={(event) =>
							onUpdateField("remarks", event.target.value)
						}
						className={`${PurchaseOrderFieldClassName} min-h-20 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
			</div>
		</div>
	);
}

function BooleanSelectField({
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
		<div className="grid min-w-0 gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
			<label htmlFor={id} className="text-sm font-semibold text-darknavy">
				{label}
			</label>
			<select
				id={id}
				value={value}
				disabled={readOnly}
				onChange={(event) => onChange(event.target.value)}
				className={PurchaseOrderFieldClassName}
			>
				{PurchaseOrderBooleanOptions.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
