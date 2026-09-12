import { PartyPurchaseTypeOptions } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type { PartyPurchaseType } from "@/app/src/types/modules/party-management/PartyManagementTypes";

export function getDefaultPartyPurchaseType(value?: readonly string[] | null): string {
  if (!value || value.length === 0) return "";
  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean);
  const hasGoods = normalized.includes("goods");
  const hasServices = normalized.includes("services");
  if (normalized.length >= 2 && hasGoods && hasServices) {
    return "Goods & Services";
  }
  return value[0]?.trim() ?? "";
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

export function parsePurchaseTypesToSelection(value?: string | readonly string[] | null): PartyPurchaseType[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return mapPartyPurchaseTypesFromApi(value);
  }
  if (typeof value === "string") {
    if (value.toLowerCase() === "goods & services") {
      return ["Goods", "Services"];
    }
    return mapPartyPurchaseTypesFromApi(value);
  }
  return [];
}

export function formatPurchaseTypesFromSelection(selected: unknown): string {
  const normalized = mapPartyPurchaseTypesFromApi(selected as readonly string[] | string | null);
  const hasGoods = normalized.includes("Goods");
  const hasServices = normalized.includes("Services");

  if (hasGoods && hasServices && normalized.length === 2) {
    return "Goods & Services";
  }
  if (normalized.length === 1) {
    return normalized[0];
  }
  return normalized.join(", ");
}

