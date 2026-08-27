import type { ReactNode } from "react";

export type CurrencyExchangeRateRowProps = {
  currencyControl: ReactNode;
  currencyControlId?: string;
  currencyError?: string;
  currencyLabel?: string;
  exchangeRateControl: ReactNode;
  exchangeRateControlId?: string;
  exchangeRateError?: string;
  exchangeRateLabel?: string;
};
