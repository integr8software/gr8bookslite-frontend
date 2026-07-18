import {
	CanvassFormCurrencyOptions,
	CanvassFormPurchaseTypeOptions,
} from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import type { CanvassFormValues } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
	AmountField,
	DateField,
	FieldClassName,
	FieldShell,
	SelectField,
	TextField,
	type CanvassFormFieldUpdater,
} from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormFieldControls";

type CanvassFormRequestFieldsProps = {
	isReadonly: boolean;
	values: CanvassFormValues;
	onUpdateField: CanvassFormFieldUpdater<CanvassFormValues>;
};

export function CanvassFormRequestFields({
	isReadonly,
	onUpdateField,
	values,
}: CanvassFormRequestFieldsProps) {
	return (
		<div className="grid min-w-0 gap-5 xl:grid-cols-2">
			<div className="grid min-w-0 gap-4">
				<SelectField
					id="canvass-form-currency"
					label="Currency"
					readOnly={isReadonly}
					value={values.currency}
					options={CanvassFormCurrencyOptions}
					onChange={(value) => onUpdateField("currency", value)}
				/>
				<SelectField
					id="canvass-form-purchase-type"
					label="Purchase Type"
					isRequired
					readOnly={isReadonly}
					value={values.purchaseType}
					options={CanvassFormPurchaseTypeOptions}
					onChange={(value) => onUpdateField("purchaseType", value)}
				/>
				<TextField
					id="canvass-form-requested-by"
					label="Requested By"
					isRequired
					readOnly={isReadonly}
					value={values.requestedBy}
					onChange={(value) => onUpdateField("requestedBy", value)}
				/>
			</div>
			<div className="grid min-w-0 content-start gap-4">
				<AmountField
					id="canvass-form-exchange-rate"
					label="Exchange Rate"
					readOnly={isReadonly}
					value={values.exchangeRate}
					onChange={(value) => onUpdateField("exchangeRate", value)}
				/>
				<TextField
					id="canvass-form-responsibility-center"
					label="Responsibility Center"
					readOnly={isReadonly}
					value={values.responsibilityCenter}
					onChange={(value) => onUpdateField("responsibilityCenter", value)}
				/>
				<DateField
					id="canvass-form-required-before"
					label="Required Before"
					readOnly={isReadonly}
					value={values.requiredBefore}
					onChange={(value) => onUpdateField("requiredBefore", value)}
				/>
			</div>
			<div className="xl:col-span-2">
				<FieldShell controlId="canvass-form-remarks" label="Remarks">
					<AppLimitedTextarea
						id="canvass-form-remarks"
						readOnly={isReadonly}
						value={values.remarks}
						onChange={(event) => onUpdateField("remarks", event.target.value)}
						className={`${FieldClassName} min-h-24 py-3`}
						counterMode="remaining"
						maxLength={250}
					/>
				</FieldShell>
			</div>
		</div>
	);
}
