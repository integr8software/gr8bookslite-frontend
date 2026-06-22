import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function formatTermDuration(
  term: Pick<TermManagement, "datemode" | "period">,
) {
  const period = Number(term.period);

  if (Number.isFinite(period) && period === 0) {
    return "Immediate";
  }

  return `${term.period} ${term.datemode.toLowerCase()}${term.period === "1" ? "" : "s"}`;
}
