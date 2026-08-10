"use client";

import { useMemo } from "react";
import { Building2, CheckCircle2, CirclePause, Landmark } from "lucide-react";
import { countUniqueBankNames } from "@/app/src/data/modules/financial-maintenance/bank-masterfile/BankMasterfileData";
import type { BankMasterfileStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { ModuleStatisticCards, type ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function BankMasterfileStatisticCards({ banks, isLoading }: BankMasterfileStatisticCardsProps) {
  const displayStatistics = useMemo(() => {
    const totalBanks = banks.length;
    const uniqueBanks = countUniqueBankNames(banks);
    const activeBanks = countUniqueBankNames(banks.filter((bank) => bank.status === "Active"));
    const inactiveBanks = countUniqueBankNames(banks.filter((bank) => bank.status === "Inactive"));

    return { activeBanks, inactiveBanks, totalBanks, uniqueBanks };
  }, [banks]);
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: Landmark,
        iconClassName: "bg-skyblue/20 text-skyblue",
        label: "Total Banks",
        summary: "All bank records",
        value: displayStatistics.totalBanks,
      },
      {
        icon: Building2,
        iconClassName: "bg-cyan-50 text-cyan-700",
        label: "Number of Banks",
        summary: "Unique bank names",
        value: displayStatistics.uniqueBanks,
      },
      {
        icon: CheckCircle2,
        iconClassName: "bg-emerald-50 text-emerald-700",
        label: "Active Banks",
        summary: "Available for transactions",
        value: displayStatistics.activeBanks,
      },
      {
        icon: CirclePause,
        iconClassName: "bg-amber-50 text-amber-700",
        label: "Inactive Banks",
        summary: "Hidden from new transactions",
        value: displayStatistics.inactiveBanks,
      },
    ],
    [displayStatistics],
  );

  return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} className="xl:grid-cols-4" />;
}
