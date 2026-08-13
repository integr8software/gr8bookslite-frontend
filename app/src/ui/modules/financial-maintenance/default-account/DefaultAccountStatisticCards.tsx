"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, FileCog, ReceiptText, WalletCards } from "lucide-react";
import type { DefaultAccountStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { ModuleStatisticCards, type ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function DefaultAccountStatisticCards({ isLoading, statistics }: DefaultAccountStatisticCardsProps) {
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: FileCog,
        iconClassName: "bg-skyblue/20 text-skyblue",
        label: "Total",
        summary: "All default accounts",
        value: statistics.totalDefaultAccounts,
      },
      {
        icon: CheckCircle2,
        iconClassName: "bg-emerald-50 text-emerald-700",
        label: "Active",
        summary: "Available for setup",
        value: statistics.activeDefaultAccounts,
      },
      {
        icon: CirclePause,
        iconClassName: "bg-amber-50 text-amber-700",
        label: "Inactive",
        summary: "Hidden from selection",
        value: statistics.inactiveDefaultAccounts,
      },
      {
        icon: ReceiptText,
        iconClassName: "bg-cyan-50 text-cyan-700",
        label: "Collections",
        summary: "Revenue templates",
        value: statistics.collectionDefaultAccounts,
      },
      {
        icon: WalletCards,
        iconClassName: "bg-rose-50 text-rose-700",
        label: "Expenses",
        summary: "Expense templates",
        value: statistics.expenseDefaultAccounts,
      },
    ],
    [statistics],
  );

  return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} className="xl:grid-cols-5" />;
}
