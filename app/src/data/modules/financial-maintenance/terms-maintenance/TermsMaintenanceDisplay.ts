import type { TermsMaintenance } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export function formatTermDuration(term: Pick<TermsMaintenance, "datemode" | "period">) {
  const period = Number(term.period);

  if (Number.isFinite(period) && period === 0) {
    return "Immediate";
  }

  return `${term.period} ${term.datemode.toLowerCase()}${term.period === "1" ? "" : "s"}`;
}
