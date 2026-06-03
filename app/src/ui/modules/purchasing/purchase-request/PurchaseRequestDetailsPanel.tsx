import {
	PurchaseRequestCurrencyOptions,
	PurchaseRequestStatusOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestFieldClassName,
	PurchaseRequestFormField,
} from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormControls";

type PurchaseRequestDetailsPanelProps = {
	errors: PurchaseRequestFormErrors;
	isReadonly: boolean;
	updateField: <TKey extends keyof PurchaseRequestFormValues>(
		field: TKey,
		value: PurchaseRequestFormValues[TKey],
	) => void;
	values: PurchaseRequestFormValues;
};

export function PurchaseRequestDetailsPanel({
	errors,
	isReadonly,
	updateField,
	values,
}: PurchaseRequestDetailsPanelProps) {
	return (
		<div className="min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Request Details
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Supplier and document fields shown on the printable purchase
						request.
					</p>
				</div>
			</div>

			<div className="grid min-w-0 gap-4 lg:grid-cols-2">
				<PurchaseRequestFormField
					label="VCE Name"
					required
					error={errors.vceName}
				>
					<input
						value={values.vceName}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("vceName", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="PR No."
					required
					error={errors.transNo}
				>
					<input
						value={values.transNo}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("transNo", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="PR Date"
					required
					error={errors.prDate}
				>
					<input
						type="date"
						value={values.prDate}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("prDate", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Currency"
					required
					error={errors.currency}
				>
					<select
						value={values.currency}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("currency", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					>
						{PurchaseRequestCurrencyOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Status"
					required
					error={errors.status}
				>
					<select
						value={values.status}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("status", event.target.value as typeof values.status)
						}
						className={PurchaseRequestFieldClassName}
					>
						{PurchaseRequestStatusOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</PurchaseRequestFormField>
			</div>
		</div>
	);
}
