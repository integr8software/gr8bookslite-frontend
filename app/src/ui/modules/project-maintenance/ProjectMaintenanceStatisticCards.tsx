"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, Folder } from "lucide-react";
import type { ProjectMaintenanceStatisticCardsProps } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { ModuleStatisticCards, type ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ProjectMaintenanceStatisticCards({ isLoading, statistics }: ProjectMaintenanceStatisticCardsProps) {
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: Folder,
        iconClassName: "bg-skyblue/20 text-skyblue",
        label: "Total Projects",
        summary: "All project records",
        value: statistics.totalProjects,
      },
      {
        icon: CheckCircle2,
        iconClassName: "bg-emerald-50 text-emerald-700",
        label: "Active Projects",
        summary: "Available for selection",
        value: statistics.activeProjects,
      },
      {
        icon: CirclePause,
        iconClassName: "bg-amber-50 text-amber-700",
        label: "Inactive Projects",
        summary: "Currently inactive",
        value: statistics.inactiveProjects,
      },
    ],
    [statistics],
  );

  return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} className="xl:grid-cols-3" />;
}
