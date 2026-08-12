import type { ReactNode } from "react";

export type CurrencyExchangeRateRowProps = {
  currencyControl: ReactNode;
  currencyLabel?: string;
  exchangeRateControl: ReactNode;
  exchangeRateControlId?: string;
  exchangeRateLabel?: string;
};
