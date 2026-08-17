import type { ReactNode } from "react";

export type CurrencyExchangeRateRowProps = {
  currencyControl: ReactNode;
  currencyControlId?: string;
  currencyLabel?: string;
  exchangeRateControl: ReactNode;
  exchangeRateControlId?: string;
  exchangeRateLabel?: string;
};
