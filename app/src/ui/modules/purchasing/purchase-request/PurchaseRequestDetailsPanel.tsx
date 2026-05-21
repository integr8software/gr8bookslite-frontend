import {
	PurchaseRequestCurrencyOptions,
	PurchaseRequestStatusOptions,
	PurchaseRequestTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
	PurchaseRequestFormErrors,
	PurchaseRequestFormValues,
	PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	PurchaseRequestFieldClassName,
	PurchaseRequestFormField,
	PurchaseRequestTextareaClassName,
} from "./PurchaseRequestFormControls";

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
						Supplier, accounting, and project fields from the
						purchase request.
					</p>
				</div>
			</div>

			<div className="grid min-w-0 gap-4 lg:grid-cols-3">
				<PurchaseRequestFormField
					label="VCE Code"
					required
					error={errors.vceCode}
				>
					<input
						value={values.vceCode}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("vceCode", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="VCE Name"
					required
					className="lg:col-span-2"
					error={errors.vceName}
				>
					<div className="flex min-w-0 gap-2">
						<input
							value={values.vceName}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("vceName", event.target.value)
							}
							className={PurchaseRequestFieldClassName}
						/>
						{!isReadonly ? (
							<button
								type="button"
								className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-skyblue px-4 text-sm font-semibold text-white transition hover:opacity-90"
							>
								Add
							</button>
						) : null}
					</div>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Purchase Type"
					required
					error={errors.purchaseType}
				>
					<select
						value={values.purchaseType}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("purchaseType", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					>
						{PurchaseRequestTypeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Trans No."
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
				<PurchaseRequestFormField label="PR Date" error={errors.prDate}>
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
				<PurchaseRequestFormField label="Status">
					<select
						value={values.status}
						disabled={isReadonly}
						onChange={(event) =>
							updateField(
								"status",
								event.target.value as PurchaseRequestStatus,
							)
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
				<PurchaseRequestFormField
					label="Currency"
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
					label="Exchange Rate"
					error={errors.exchangeRate}
				>
					<input
						type="number"
						step="0.0001"
						value={values.exchangeRate}
						disabled={isReadonly}
						onChange={(event) =>
							updateField(
								"exchangeRate",
								Number(event.target.value),
							)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField label="BOM No.">
					<input
						value={values.bomNo}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("bomNo", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField label="Project Code">
					<input
						value={values.projectCode}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("projectCode", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Project Name"
					className="lg:col-span-2"
				>
					<input
						value={values.projectName}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("projectName", event.target.value)
						}
						className={PurchaseRequestFieldClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField
					label="Vendor Address"
					className="lg:col-span-2"
				>
					<textarea
						value={values.vendorAddress}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("vendorAddress", event.target.value)
						}
						className={PurchaseRequestTextareaClassName}
					/>
				</PurchaseRequestFormField>
				<PurchaseRequestFormField label="Remarks">
					<textarea
						value={values.remarks}
						disabled={isReadonly}
						onChange={(event) =>
							updateField("remarks", event.target.value)
						}
						className={PurchaseRequestTextareaClassName}
					/>
				</PurchaseRequestFormField>
			</div>
		</div>
	);
}
