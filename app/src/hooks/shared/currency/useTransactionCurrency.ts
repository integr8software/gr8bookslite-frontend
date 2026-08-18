"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createCurrencyCatalogFromReferencesAndRates, resolveFetchedExchangeRate } from "@/app/src/data/shared/currency/CurrencyOptionsData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useMultiCurrencySetupRates } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupRates";
import { useOnboardingReferenceData } from "@/app/src/hooks/onboarding/useOnboardingReferenceData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

const DefaultBaseCurrencyCode = "PHP";

export function useTransactionCurrency() {
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const activeCompanyId = authProfileQuery.data?.activeCompanyId ?? null;
  const baseCurrencyCode =
    authProfileQuery.data?.companies
      ?.find((company) => company.companyId === activeCompanyId)
      ?.baseCurrencyCode?.trim()
      .toUpperCase() ?? DefaultBaseCurrencyCode;
  const referenceData = useOnboardingReferenceData();
  const ratesQuery = useMultiCurrencySetupRates(baseCurrencyCode);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const exchangeRateRequestIdRef = useRef(0);
  const currencyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      createCurrencyCatalogFromReferencesAndRates(
        referenceData.currencies,
        ratesQuery.data ?? [],
        baseCurrencyCode,
      ).map((currency) => ({
        label: currency.code === baseCurrencyCode ? `${currency.name} | Default` : `${currency.code} - ${currency.name}`,
        name: currency.code,
        value: currency.code,
      })),
    [baseCurrencyCode, ratesQuery.data, referenceData.currencies],
  );

  const loadExchangeRate = useCallback(
    async (currencyCode: string) => {
      const normalizedCurrencyCode = currencyCode.trim().toUpperCase();
      const requestId = exchangeRateRequestIdRef.current + 1;

      exchangeRateRequestIdRef.current = requestId;

      if (!normalizedCurrencyCode || normalizedCurrencyCode === baseCurrencyCode) {
        setIsExchangeRateLoading(false);
        return normalizedCurrencyCode ? 1 : null;
      }

      setIsExchangeRateLoading(true);

      try {
        const rates = ratesQuery.data ?? (await FetchMultiCurrencyRates(baseCurrencyCode));
        const exchangeRate = resolveFetchedExchangeRate(rates, baseCurrencyCode, normalizedCurrencyCode);

        if (exchangeRateRequestIdRef.current !== requestId) {
          return null;
        }

        if (exchangeRate == null) {
          throw new Error(`No ${normalizedCurrencyCode} exchange rate returned.`);
        }

        return exchangeRate;
      } finally {
        if (exchangeRateRequestIdRef.current === requestId) {
          setIsExchangeRateLoading(false);
        }
      }
    },
    [baseCurrencyCode, ratesQuery.data],
  );

  return {
    baseCurrencyCode,
    currencyOptions,
    isBaseCurrencyResolved: activeCompanyId != null && Boolean(authProfileQuery.data),
    isExchangeRateLoading,
    loadExchangeRate,
  };
}

export function formatLoadedExchangeRate(value: number) {
  const [wholePart, decimalPart = ""] = value.toFixed(6).split(".");
  const significantDecimalPart = decimalPart.replace(/0+$/, "").padEnd(2, "0");

  return `${wholePart}.${significantDecimalPart}`;
}
