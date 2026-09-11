export function getDefaultPartyPurchaseType(value?: readonly string[] | null): string {
  return value?.[0]?.trim() ?? "";
}
