import type { ReactNode } from "react";

type CurrencyExchangeRateRowProps = {
  currencyControl: ReactNode;
  currencyLabel?: string;
  exchangeRateControl: ReactNode;
  exchangeRateLabel?: string;
};

export function CurrencyExchangeRateRow({
  currencyControl,
  currencyLabel,
  exchangeRateControl,
  exchangeRateLabel = "Exchange Rate",
}: CurrencyExchangeRateRowProps) {
  return (
    <div
      className={
        currencyLabel
          ? "grid min-w-0 gap-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_max-content_6.5rem] sm:items-start"
          : "grid min-w-0 gap-1.5 sm:grid-cols-[minmax(0,1fr)_max-content_6.5rem] sm:items-start"
      }
    >
      {currencyLabel ? <span className="pt-2 text-sm font-semibold text-darknavy">{currencyLabel}</span> : null}
      <div className="min-w-0">{currencyControl}</div>
      <span className="whitespace-nowrap pt-2 text-sm font-semibold text-darknavy">{exchangeRateLabel}</span>
      <div className="min-w-0">{exchangeRateControl}</div>
    </div>
  );
}
