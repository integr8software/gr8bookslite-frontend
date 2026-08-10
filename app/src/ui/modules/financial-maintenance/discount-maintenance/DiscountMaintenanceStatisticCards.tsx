"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, Percent, ShoppingCart, Tags, WalletCards } from "lucide-react";
import type { DiscountMaintenanceStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { ModuleStatisticCards, type ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function DiscountMaintenanceStatisticCards({ isLoading, statistics }: DiscountMaintenanceStatisticCardsProps) {
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: Percent,
        iconClassName: "bg-skyblue/20 text-skyblue",
        label: "Total",
        summary: "All discount records",
        value: statistics.totalDiscounts,
      },
      {
        icon: CheckCircle2,
        iconClassName: "bg-emerald-50 text-emerald-700",
        label: "Active",
        summary: "Available for selection",
        value: statistics.activeDiscounts,
      },
      {
        icon: CirclePause,
        iconClassName: "bg-amber-50 text-amber-700",
        label: "Inactive",
        summary: "Currently inactive",
        value: statistics.inactiveDiscounts,
      },
      {
        icon: ShoppingCart,
        iconClassName: "bg-cyan-50 text-cyan-700",
        label: "Purchases",
        summary: "Purchase discounts",
        value: statistics.purchaseDiscounts,
      },
      {
        icon: WalletCards,
        iconClassName: "bg-violet-50 text-violet-700",
        label: "Sales",
        summary: "Sales discounts",
        value: statistics.salesDiscounts,
      },
      {
        icon: Tags,
        iconClassName: "bg-slate-100 text-slate-700",
        label: "Percentage Type",
        summary: "Percentage discounts",
        value: statistics.percentageDiscounts,
      },
    ],
    [statistics],
  );

  return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} className="xl:grid-cols-6" />;
}
