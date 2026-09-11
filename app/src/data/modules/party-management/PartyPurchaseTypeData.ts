import { PartyPurchaseTypeOptions } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type { PartyPurchaseType } from "@/app/src/types/modules/party-management/PartyManagementTypes";

export function getDefaultPartyPurchaseType(value?: readonly string[] | null): string {
  return value?.[0]?.trim() ?? "";
}

export function mapPartyPurchaseTypesFromApi(value?: readonly string[] | string | null): PartyPurchaseType[] {
  const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const normalized = rawValues
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .map((item) =>
      PartyPurchaseTypeOptions.find((option) => option.toLowerCase() === item.toLowerCase()),
    )
    .filter((option): option is PartyPurchaseType => Boolean(option));

  return Array.from(new Set(normalized));
}

