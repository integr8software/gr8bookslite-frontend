"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GetCountryReferences,
  GetCurrencyReferences,
  ReferenceQueryKeys,
} from "@/app/src/services/shared/reference/ReferenceApi";

const ReferenceStaleTime = 24 * 60 * 60 * 1000;

export function useOnboardingReferenceData() {
  const countriesQuery = useQuery({
    queryKey: ReferenceQueryKeys.countries(),
    queryFn: GetCountryReferences,
    staleTime: ReferenceStaleTime,
  });
  const currenciesQuery = useQuery({
    queryKey: ReferenceQueryKeys.currencies(),
    queryFn: GetCurrencyReferences,
    staleTime: ReferenceStaleTime,
  });

  return {
    countries: countriesQuery.data ?? [],
    currencies: currenciesQuery.data ?? [],
    isLoading: countriesQuery.isLoading || currenciesQuery.isLoading,
  };
}
