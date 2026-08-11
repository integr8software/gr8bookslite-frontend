import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  CountryReference,
  CurrencyReference,
} from "@/app/src/types/shared/reference/ReferenceTypes";

export const ReferenceQueryKeys = {
  countries: () => ["reference", "countries"] as const,
  currencies: () => ["reference", "currencies"] as const,
};

export async function GetCountryReferences() {
  const response = await ApiClient.get<{ countries: CountryReference[] }>(
    "/reference/countries",
  );

  return response.data.countries;
}

export async function GetCurrencyReferences() {
  const response = await ApiClient.get<{ currencies: CurrencyReference[] }>(
    "/reference/currencies",
  );

  return response.data.currencies;
}
