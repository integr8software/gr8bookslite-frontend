import type { TaxDefinitionTreatment } from "@/app/src/types/shared/tax/TaxDefinitionTypes";

export function formatTaxDefinitionPercentage(
  value: string | number,
  treatment: TaxDefinitionTreatment,
) {
  if (treatment === "EXEMPT") return "Exempt";
  if (treatment === "OUT_OF_SCOPE") return "Out of scope";
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })}%`;
}
