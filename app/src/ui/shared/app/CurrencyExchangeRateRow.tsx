import type { CurrencyExchangeRateRowProps } from "@/app/src/types/shared/app/CurrencyExchangeRateRowTypes";

export function CurrencyExchangeRateRow({
  currencyControl,
  currencyControlId,
  currencyError,
  currencyLabel,
  exchangeRateControl,
  exchangeRateControlId,
  exchangeRateError,
  exchangeRateLabel = "Exchange Rate",
}: CurrencyExchangeRateRowProps) {
  if (currencyLabel) {
    return (
      <div className="grid min-w-0 grid-cols-[10rem_minmax(0,1fr)_10rem_minmax(0,1fr)] items-start gap-2 max-[640px]:grid-cols-1 min-[640px]:max-[768px]:grid-cols-[10rem_minmax(0,1fr)] min-[1280px]:max-[1700px]:grid-cols-[10rem_minmax(0,1fr)]">
        {currencyControlId ? (
          <label htmlFor={currencyControlId} className="pt-2 text-sm font-semibold text-darknavy">
            {currencyLabel}
          </label>
        ) : (
          <span className="pt-2 text-sm font-semibold text-darknavy">{currencyLabel}</span>
        )}
        <div className="min-w-0">
          {currencyControl}
          {currencyError ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{currencyError}</span> : null}
        </div>
        {exchangeRateControlId ? (
          <label
            htmlFor={exchangeRateControlId}
            className="whitespace-nowrap pt-2 text-sm font-semibold text-darknavy min-[768px]:max-[1280px]:text-right min-[1700px]:text-right"
          >
            {exchangeRateLabel}
          </label>
        ) : (
          <span className="whitespace-nowrap pt-2 text-sm font-semibold text-darknavy min-[768px]:max-[1280px]:text-right min-[1700px]:text-right">
            {exchangeRateLabel}
          </span>
        )}
        <div className="min-w-0">
          {exchangeRateControl}
          {exchangeRateError ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{exchangeRateError}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_max-content_6.5rem]">
      <div className="min-w-0">
        {currencyControl}
        {currencyError ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{currencyError}</span> : null}
      </div>
      {exchangeRateControlId ? (
        <label htmlFor={exchangeRateControlId} className="hidden whitespace-nowrap pt-2 text-sm font-semibold text-darknavy sm:block">
          {exchangeRateLabel}
        </label>
      ) : (
        <span className="hidden whitespace-nowrap pt-2 text-sm font-semibold text-darknavy sm:block">{exchangeRateLabel}</span>
      )}
      <div className="min-w-0">
        {exchangeRateControl}
        {exchangeRateError ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{exchangeRateError}</span> : null}
      </div>
    </div>
  );
}
