import type { CurrencyExchangeRateRowProps } from "@/app/src/types/shared/app/CurrencyExchangeRateRowTypes";

export function CurrencyExchangeRateRow({
  currencyControl,
  currencyControlId,
  currencyLabel,
  exchangeRateControl,
  exchangeRateControlId,
  exchangeRateLabel = "Exchange Rate",
}: CurrencyExchangeRateRowProps) {
  return (
    <div
      className={
        currencyLabel
          ? "grid min-w-0 gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_max-content_6.5rem] sm:items-start"
          : "grid min-w-0 gap-1.5 sm:grid-cols-[minmax(0,1fr)_max-content_6.5rem] sm:items-start"
      }
    >
      {currencyLabel ? (
        currencyControlId ? (
          <label htmlFor={currencyControlId} className="pt-2 text-sm font-semibold text-darknavy">
            {currencyLabel}
          </label>
        ) : (
          <span className="pt-2 text-sm font-semibold text-darknavy">{currencyLabel}</span>
        )
      ) : null}
      <div className="min-w-0">{currencyControl}</div>
      {exchangeRateControlId ? (
        <label
          htmlFor={exchangeRateControlId}
          className="whitespace-nowrap pt-2 text-sm font-semibold text-darknavy"
        >
          {exchangeRateLabel}
        </label>
      ) : (
        <span className="whitespace-nowrap pt-2 text-sm font-semibold text-darknavy">{exchangeRateLabel}</span>
      )}
      <div className="min-w-0">{exchangeRateControl}</div>
    </div>
  );
}
