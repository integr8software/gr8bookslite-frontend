import {
  BeginningBalanceUploaderCurrencyOptions,
  BeginningBalanceUploaderPageCopy,
} from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type BeginningBalanceUploaderHeaderPanelProps = {
  date: string;
  currencyRate: string;
  currencyType: string;
  remarks: string;
  isReadonly: boolean;
  transactionNumber?: string;
  onDateChange: (value: string) => void;
  onCurrencyRateChange: (value: string) => void;
  onCurrencyTypeChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
};

export function BeginningBalanceUploaderHeaderPanel({
  date,
  currencyRate,
  currencyType,
  remarks,
  isReadonly,
  transactionNumber = "Generated on save",
  onDateChange,
  onCurrencyRateChange,
  onCurrencyTypeChange,
  onRemarksChange,
}: BeginningBalanceUploaderHeaderPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="border-b border-darknavy/10 bg-offwhite/70 px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-darknavy">
          {BeginningBalanceUploaderPageCopy.headerTitle}
        </h2>
        <p className="mt-1 text-sm text-darknavy/55">
          Enter the transaction reference, document date, and reporting currency.
        </p>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-5 xl:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr]">
        <label className="block md:col-span-2 xl:col-span-1 xl:row-span-2">
          <span className="text-sm font-medium text-darknavy/55">Remarks</span>
          <textarea
            value={remarks}
            readOnly={isReadonly}
            onChange={(event) => onRemarksChange(event.target.value)}
            className="mt-1 block h-24 w-full resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/30 focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
            placeholder="Enter remarks"
          />
        </label>

        <div className="block">
          <label
            htmlFor="beginning-balance-currency-type"
            className="text-sm font-medium text-darknavy/55"
          >
            Currency Type *
          </label>
          <AppAdvancedDropdown
            id="beginning-balance-currency-type"
            className="mt-1"
            isClearable={false}
            readOnly={isReadonly}
            options={[...BeginningBalanceUploaderCurrencyOptions]}
            placeholder="Select currency"
            searchPlaceholder="Search currency"
            value={currencyType}
            onChange={(value) => onCurrencyTypeChange(String(value))}
          />
        </div>

        <label className="block">
          <span className="text-sm font-medium text-darknavy/55">Currency Rate *</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.0001"
            value={currencyRate}
            readOnly={isReadonly}
            onChange={(event) => onCurrencyRateChange(event.target.value)}
            className="mt-1 block h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-right text-sm tabular-nums text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-darknavy/55">Transaction No.</span>
          <input value={transactionNumber} readOnly className="mt-1 block h-10 w-full rounded-md border border-darknavy/10 bg-offwhite px-3 text-sm text-darknavy/55" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-darknavy/55">Document Date *</span>
          <input
            type="date"
            value={date}
            readOnly={isReadonly}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 block h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
          />
        </label>
      </div>
    </section>
  );
}
