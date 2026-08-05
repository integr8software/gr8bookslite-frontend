"use client";

import { useMemo } from "react";
import { AlertTriangle, Gauge, ListChecks, Power, PowerOff, ShieldAlert, Truck } from "lucide-react";
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
    () =>
      config.key === "vehicle-types"
        ? [
            {
              icon: Truck,
              iconClassName: "bg-skyblue/20 text-skyblue",
              label: "Vehicle Types",
              summary: "Current filtered scope",
              value: statistics.total,
            },
            {
              icon: Power,
              iconClassName: "bg-emerald-50 text-emerald-700",
              label: "Active Types",
              summary: "Available for selection",
              value: statistics.active,
            },
            {
              icon: PowerOff,
              iconClassName: "bg-slate-100 text-slate-700",
              label: "Inactive Types",
              summary: "Unavailable for selection",
              value: statistics.inactive,
            },
            {
              icon: ShieldAlert,
              iconClassName: "bg-amber-50 text-amber-700",
              label: "Hazardous Types",
              summary: "Hazardous eligible",
              value: statistics.hazardous,
            },
          ]
        : config.key === "delivery-vehicles"
          ? [
              {
                icon: Truck,
                iconClassName: "bg-skyblue/20 text-skyblue",
                label: "Vehicles",
                summary: "Current filtered scope",
                value: statistics.total,
              },
              {
                icon: ListChecks,
                iconClassName: "bg-cyan-50 text-cyan-700",
                label: "Dispatch Queue",
                summary: "Pending, scheduled, or ready",
                value: statistics.dispatchQueue,
              },
              {
                icon: Gauge,
                iconClassName: "bg-emerald-50 text-emerald-700",
                label: "In Transit",
                summary: "Currently on route",
                value: statistics.inTransit,
              },
              {
                icon: AlertTriangle,
                iconClassName:
                  statistics.attention > 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-700",
                label: "Compliance Alerts",
                summary: statistics.attention > 0 ? "Needs follow-up" : "No alerts in scope",
                value: statistics.attention,
              },
            ]
          : config.key === "vehicle-repair-maintenance"
            ? [
                {
                  icon: ListChecks,
                  iconClassName: "bg-skyblue/20 text-skyblue",
                  label: "Work Orders",
                  summary: "Current filtered scope",
                  value: statistics.total,
                },
                {
                  icon: Gauge,
                  iconClassName: "bg-cyan-50 text-cyan-700",
                  label: "Scheduled",
                  summary: "Planned service",
                  value: statistics.scheduledWorkOrders,
                },
                {
                  icon: AlertTriangle,
                  iconClassName:
                    statistics.activeWorkOrders > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-700",
                  label: "In Service",
                  summary: "In progress or waiting",
                  value: statistics.activeWorkOrders,
                },
                {
                  icon: Power,
                  iconClassName: "bg-emerald-50 text-emerald-700",
                  label: "Completed",
                  summary: "Completed or released",
                  value: statistics.completedWorkOrders,
                },
              ]
            : [
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
                statistics.attention > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-700",
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
