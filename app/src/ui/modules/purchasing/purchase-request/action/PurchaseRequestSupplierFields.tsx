import {
	PurchaseRequestCurrencyOptions,
	PurchaseRequestStatusOptions,
	PurchaseRequestTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
	PurchaseRequestFormValues,
	PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestAttachedTextField,
	PurchaseRequestDateField,
	PurchaseRequestFieldClassName,
	PurchaseRequestFieldShell,
	PurchaseRequestSelectField,
	PurchaseRequestTextField,
	type PurchaseRequestFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-request/action/PurchaseRequestFormControls";
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
	return (
		<div className="grid min-w-0 gap-4 xl:grid-cols-3">
			<div className="grid min-w-0 gap-4">
				<PurchaseRequestTextField
					id="purchase-request-trans-no"
					label="PR No."
					isRequired
					readOnly={isReadonly}
					value={values.transNo}
					onChange={(value) => onUpdateField("transNo", value)}
				/>
				<PurchaseRequestTextField
					id="purchase-request-vce-code"
					label="Party Code"
					isRequired
					readOnly={isReadonly}
					value={values.vceCode}
					onChange={(value) => onUpdateField("vceCode", value)}
				/>
				<PurchaseRequestAttachedTextField
					id="purchase-request-vce-name"
					label="Party Name"
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
			</div>

			<div className="grid min-w-0 content-start gap-4">
				<PurchaseRequestSelectField
					id="purchase-request-purchase-type"
					label="Purchase Type"
					isRequired
					readOnly={isReadonly}
					value={values.purchaseType}
					options={PurchaseRequestTypeOptions}
					onChange={(value) => onUpdateField("purchaseType", value)}
				/>
				<PurchaseRequestDateField
					id="purchase-request-pr-date"
					label="PR Date"
					readOnly={isReadonly}
					value={values.prDate}
					onChange={(value) => onUpdateField("prDate", value)}
				/>
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
				<PurchaseRequestTextField
					id="purchase-request-bom-no"
					label="BOM No."
					readOnly={isReadonly}
					value={values.bomNo}
					onChange={(value) => onUpdateField("bomNo", value)}
				/>
			</div>

			<div className="grid min-w-0 content-start gap-4">
				<PurchaseRequestSelectField
					id="purchase-request-status"
					label="Status"
					readOnly={isReadonly}
					value={values.status}
					options={PurchaseRequestStatusOptions}
					onChange={(value) =>
						onUpdateField("status", value as PurchaseRequestStatus)
					}
				/>
				<PurchaseRequestTextField
					id="purchase-request-project-code"
					label="Project Code"
					readOnly={isReadonly}
					value={values.projectCode}
					onChange={(value) => onUpdateField("projectCode", value)}
				/>
				<PurchaseRequestTextField
					id="purchase-request-project-name"
					label="Project Name"
					readOnly={isReadonly}
					value={values.projectName}
					onChange={(value) => onUpdateField("projectName", value)}
				/>
				<PurchaseRequestFieldShell
					controlId="purchase-request-gross-amount"
					label="Total Quantity"
				>
					<input
						id="purchase-request-gross-amount"
						readOnly
						value={formatPurchaseRequestQuantity(values.items)}
						className={`${PurchaseRequestFieldClassName} text-right`}
					/>
				</PurchaseRequestFieldShell>
			</div>

			<div className="xl:col-span-3">
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

function formatPurchaseRequestQuantity(
	items: Pick<PurchaseRequestFormValues, "items">["items"],
) {
	return Math.trunc(
		items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
	).toLocaleString("en-US");
}
