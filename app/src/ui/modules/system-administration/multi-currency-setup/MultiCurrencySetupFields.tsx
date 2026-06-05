import type { ChangeEventHandler, ReactNode } from "react";
import {
	MultiCurrencyCatalog,
	getCurrencyLabel,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { MultiCurrencySetupStatusOptions } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import type {
	MultiCurrencyFetchedRate,
	MultiCurrencySetupFormErrors,
	MultiCurrencySetupFormValues,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

type MultiCurrencySetupFieldsProps = {
	baseOriginalExchangeRateDisplay: string;
	errors: MultiCurrencySetupFormErrors;
	fetchedExchangeRateDisplay: string;
	fetchedRate?: MultiCurrencyFetchedRate;
	hasCurrencyPairChanged: boolean;
	inverseExchangeRateDisplay: string;
	isRateLoading: boolean;
	isReadonly: boolean;
	originalExchangeRateDisplay: string;
	values: MultiCurrencySetupFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>;
};

export function MultiCurrencySetupFields({
	baseOriginalExchangeRateDisplay,
	errors,
	fetchedExchangeRateDisplay,
	fetchedRate,
	hasCurrencyPairChanged,
	inverseExchangeRateDisplay,
	isRateLoading,
	isReadonly,
	originalExchangeRateDisplay,
	values,
	onInputChange,
}: MultiCurrencySetupFieldsProps) {
	return (
		<div className="grid gap-5">
			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-2">
					<FormField
						label="Base Currency"
						error={errors.baseCurrencyCode}
						required
					>
						<select
							name="baseCurrencyCode"
							value={values.baseCurrencyCode}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{MultiCurrencyCatalog.map((currency) => (
								<option key={currency.code} value={currency.code}>
									{currency.code} - {currency.name}
								</option>
							))}
						</select>
					</FormField>

					<FormField
						label="Wanted Currency"
						error={errors.targetCurrencyCode}
						required
					>
						<select
							name="targetCurrencyCode"
							value={values.targetCurrencyCode}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{MultiCurrencyCatalog.map((currency) => (
								<option key={currency.code} value={currency.code}>
									{currency.code} - {currency.name}
								</option>
							))}
						</select>
					</FormField>

					<FormField label="Rate Date" error={errors.rateDate} required>
						<input
							name="rateDate"
							type="date"
							value={values.rateDate}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={fieldClassName}
						/>
					</FormField>

					<FormField label="Status" error={errors.status} required>
						<select
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{MultiCurrencySetupStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>

					<FormField label="Notes" error={errors.notes}>
						<textarea
							name="notes"
							value={values.notes}
							onChange={onInputChange}
							readOnly={isReadonly}
							rows={4}
							className={`${fieldClassName} min-h-28 resize-y py-3`}
							placeholder="Add settlement notes or source remarks"
						/>
					</FormField>
				</div>
			</div>

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<ReadonlyRate
						label="Base Original Rate"
						value={baseOriginalExchangeRateDisplay}
						helper={getCurrencyLabel(values.baseCurrencyCode)}
					/>
					<ReadonlyRate
						label="Original Exchange Rate"
						value={originalExchangeRateDisplay}
						helper={
							hasCurrencyPairChanged
								? "Will refresh when saved"
								: `Captured for ${values.targetCurrencyCode}`
						}
					/>
					<ReadonlyRate
						label="Fetched Exchange Rate"
						value={isRateLoading ? "Fetching..." : fetchedExchangeRateDisplay}
						helper={`1 ${values.baseCurrencyCode} to ${values.targetCurrencyCode}`}
					/>
					<ReadonlyRate
						label="Inverse Rate"
						value={isRateLoading ? "Fetching..." : inverseExchangeRateDisplay}
						helper={`1 ${values.targetCurrencyCode} to ${values.baseCurrencyCode}`}
					/>
				</div>
				{fetchedRate ? (
					<p className="mt-4 text-sm text-darknavy/60">
						Rate source date: {fetchedRate.rateAsOf}
					</p>
				) : null}
			</div>
		</div>
	);
}

function FormField({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={label === "Notes" ? "lg:col-span-2" : undefined}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

function ReadonlyRate({
	helper,
	label,
	value,
}: {
	helper: string;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-md border border-darknavy/10 bg-offwhite/65 p-4">
			<p className="text-xs font-semibold uppercase text-darknavy/55">
				{label}
			</p>
			<p className="mt-2 truncate font-mono text-xl font-semibold text-darknavy">
				{value}
			</p>
			<p className="mt-1 truncate text-sm text-darknavy/55">{helper}</p>
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
