import {
	PurchaseRequestCurrencyOptions,
	PurchaseRequestTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import {
	formatPurchaseRequestCurrency,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestFormValues } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestAttachedTextField,
	PurchaseRequestFieldClassName,
	PurchaseRequestFieldShell,
	PurchaseRequestSelectField,
	PurchaseRequestTextField,
	type PurchaseRequestFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type PurchaseRequestSupplierFieldsProps = {
	isReadonly: boolean;
	values: PurchaseRequestFormValues;
	onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestSupplierFields({
	isReadonly,
	onUpdateField,
	values,
}: PurchaseRequestSupplierFieldsProps) {
	const grossAmount = getPurchaseRequestTotal({ items: values.items });

	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4 sm:grid-cols-2">
				<PurchaseRequestSelectField
					id="purchase-request-currency"
					label="Currency"
					readOnly={isReadonly}
					value={values.currency}
					options={PurchaseRequestCurrencyOptions}
					onChange={(value) => onUpdateField("currency", value)}
				/>
				<PurchaseRequestFieldShell
					controlId="purchase-request-exchange-rate"
					label="Exchange Rate"
				>
					<input
						id="purchase-request-exchange-rate"
						type="number"
						readOnly={isReadonly}
						value={values.exchangeRate}
						onChange={(event) =>
							onUpdateField("exchangeRate", Number(event.target.value))
						}
						className={`${PurchaseRequestFieldClassName} text-right`}
					/>
				</PurchaseRequestFieldShell>
			</div>
			<PurchaseRequestSelectField
				id="purchase-request-purchase-type"
				label="Purchase Type"
				isRequired
				readOnly={isReadonly}
				value={values.purchaseType}
				options={PurchaseRequestTypeOptions}
				onChange={(value) => onUpdateField("purchaseType", value)}
			/>
			<PurchaseRequestTextField
				id="purchase-request-vce-code"
				label="VCE Code"
				isRequired
				readOnly={isReadonly}
				value={values.vceCode}
				onChange={(value) => onUpdateField("vceCode", value)}
			/>
			<PurchaseRequestFieldShell
				controlId="purchase-request-gross-amount"
				label="Gross Amount"
			>
				<input
					id="purchase-request-gross-amount"
					readOnly
					value={formatPurchaseRequestCurrency(grossAmount)}
					className={`${PurchaseRequestFieldClassName} text-right`}
				/>
			</PurchaseRequestFieldShell>
			<PurchaseRequestAttachedTextField
				id="purchase-request-vce-name"
				label="VCE Name"
				isRequired
				readOnly={isReadonly}
				value={values.vceName}
				onAdd={() => undefined}
				onChange={(value) => onUpdateField("vceName", value)}
			/>
			<PurchaseRequestFieldShell
				controlId="purchase-request-vendor-address"
				label="Vendor Address"
			>
				<textarea
					id="purchase-request-vendor-address"
					readOnly={isReadonly}
					value={values.vendorAddress}
					onChange={(event) =>
						onUpdateField("vendorAddress", event.target.value)
					}
					className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
				/>
			</PurchaseRequestFieldShell>
			<div className="xl:col-span-2">
				<PurchaseRequestFieldShell
					controlId="purchase-request-remarks"
					label="Remarks"
				>
					<AppLimitedTextarea
						id="purchase-request-remarks"
						readOnly={isReadonly}
						value={values.remarks}
						onChange={(event) =>
							onUpdateField("remarks", event.target.value)
						}
						className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</PurchaseRequestFieldShell>
			</div>
		</div>
	);
}
