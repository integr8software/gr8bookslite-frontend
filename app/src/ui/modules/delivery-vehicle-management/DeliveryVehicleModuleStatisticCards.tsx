"use client";

import { useMemo } from "react";
import { AlertTriangle, Gauge, ListChecks, Truck } from "lucide-react";
import type {
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModulePageState,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
  ModuleStatisticCards,
  type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

type DeliveryVehicleModuleStatisticCardsProps = {
  config: DeliveryVehicleModuleConfig;
  isLoading?: boolean;
  statistics: DeliveryVehicleModulePageState["statistics"];
};

export function DeliveryVehicleModuleStatisticCards({
  config,
  isLoading = false,
  statistics,
}: DeliveryVehicleModuleStatisticCardsProps) {
  const items = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: Truck,
        iconClassName: "bg-skyblue/20 text-skyblue",
        label: "Records",
        summary: "Current filtered scope",
        value: statistics.total,
      },
      {
        icon: AlertTriangle,
        iconClassName:
          statistics.attention > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700",
        label: "Needs Review",
        summary: statistics.attention > 0 ? "Review before dispatch" : "No alerts in scope",
        value: statistics.attention,
      },
      {
        icon: ListChecks,
        iconClassName: "bg-emerald-50 text-emerald-700",
        label: config.insightLabel,
        summary: "Operational insight",
        value: statistics.insight,
      },
      {
        icon: Gauge,
        iconClassName: "bg-cyan-50 text-cyan-700",
        label: config.key === "vehicle-repair-maintenance" ? "Progress" : "Readiness",
        summary:
          config.key === "vehicle-repair-maintenance"
            ? "Work completion average"
            : "Average profile completion",
        value:
          config.key === "vehicle-repair-maintenance"
            ? `${statistics.averageProgress}%`
            : `${statistics.averageProgress}%`,
      },
    ],
    [config.insightLabel, config.key, statistics],
  );

  return <ModuleStatisticCards items={items} isLoading={isLoading} className="xl:grid-cols-4" />;
}
