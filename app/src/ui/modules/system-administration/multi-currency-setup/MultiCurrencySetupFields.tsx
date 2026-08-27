import type { ChangeEventHandler, ReactNode } from "react";
import { getCurrencyLabel } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import type {
  MultiCurrencyCatalogItem,
  MultiCurrencyFetchedRate,
  MultiCurrencySetupFormErrors,
  MultiCurrencySetupFormValues,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type MultiCurrencySetupFieldsProps = {
  baseOriginalExchangeRateDisplay: string;
  currencyOptions: MultiCurrencyCatalogItem[];
  errors: MultiCurrencySetupFormErrors;
  fetchedExchangeRateDisplay: string;
  fetchedRate?: MultiCurrencyFetchedRate;
  hasCurrencyPairChanged: boolean;
  inverseExchangeRateDisplay: string;
  isRateLoading: boolean;
  isReadonly: boolean;
  originalExchangeRateDisplay: string;
  values: MultiCurrencySetupFormValues;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  onFieldChange: (
    field: keyof MultiCurrencySetupFormValues,
    value: MultiCurrencySetupFormValues[keyof MultiCurrencySetupFormValues] | string,
  ) => void;
};

export function MultiCurrencySetupFields({
  baseOriginalExchangeRateDisplay,
  currencyOptions,
  errors,
  fetchedExchangeRateDisplay,
  fetchedRate,
  hasCurrencyPairChanged,
  inverseExchangeRateDisplay,
  isRateLoading,
  isReadonly,
  originalExchangeRateDisplay,
  values,
  onFieldChange,
  onInputChange,
}: MultiCurrencySetupFieldsProps) {
  const dropdownOptions = currencyOptions.map<AppAdvancedDropdownOption>((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    name: currency.code,
    value: currency.code,
  }));

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Base Currency" error={errors.baseCurrencyCode} required>
            <AppAdvancedDropdown
              id="multi-currency-baseCurrencyCode"
              name="baseCurrencyCode"
              value={values.baseCurrencyCode}
              options={dropdownOptions}
              placeholder="Select base currency"
              readOnly={isReadonly}
              isClearable={false}
              onChange={(value) => onFieldChange("baseCurrencyCode", String(value))}
            />
          </FormField>

          <FormField label="Wanted Currency" error={errors.targetCurrencyCode} required>
            <AppAdvancedDropdown
              id="multi-currency-targetCurrencyCode"
              name="targetCurrencyCode"
              value={values.targetCurrencyCode}
              options={dropdownOptions}
              placeholder="Select wanted currency"
              readOnly={isReadonly}
              isClearable={false}
              onChange={(value) => onFieldChange("targetCurrencyCode", String(value))}
            />
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

          <FormField label="Availability" error={errors.status} required>
            <input name="status" value={values.status === "Active" ? "Enabled" : "Disabled"} readOnly className={fieldClassName} />
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
            label="Configured Daily Rate"
            value={originalExchangeRateDisplay}
            helper={hasCurrencyPairChanged ? "Will refresh when saved" : `1 ${values.targetCurrencyCode} in ${values.baseCurrencyCode}`}
          />
          <ReadonlyRate
            label="BSP Rate"
            value={isRateLoading ? "Fetching..." : fetchedExchangeRateDisplay}
            helper={`1 ${values.targetCurrencyCode} in ${values.baseCurrencyCode}`}
          />
          <ReadonlyRate
            label="Inverse Rate"
            value={isRateLoading ? "Fetching..." : inverseExchangeRateDisplay}
            helper={`1 ${values.baseCurrencyCode} in ${values.targetCurrencyCode}`}
          />
        </div>
        {fetchedRate ? <p className="mt-4 text-sm text-darknavy/60">Rate source date: {fetchedRate.rateAsOf}</p> : null}
      </div>
    </div>
  );
}

function FormField({ children, error, label, required }: { children: ReactNode; error?: string; label: string; required?: boolean }) {
  return (
    <label className={label === "Notes" ? "lg:col-span-2" : undefined}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

function ReadonlyRate({ helper, label, value }: { helper: string; label: string; value: string }) {
  return (
    <div className="rounded-md border border-darknavy/10 bg-offwhite/65 p-4">
      <p className="text-xs font-semibold uppercase text-darknavy/55">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold text-darknavy">{value}</p>
      <p className="mt-1 truncate text-sm text-darknavy/55">{helper}</p>
    </div>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
