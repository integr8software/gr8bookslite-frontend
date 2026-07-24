"use client";

import {
  Box,
  ClipboardCheck,
  Layers3,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import type { WarehouseCapacityStorageRulesRecord } from "@/app/src/types/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function WarehouseCapacityRuleDetails({
  record,
}: {
  record: WarehouseCapacityStorageRulesRecord | null;
}) {
  if (!record) {
    return (
      <div className="rounded-lg border border-dashed border-darknavy/15 bg-white p-8 text-center shadow-sm">
        <Ruler className="mx-auto h-6 w-6 text-darknavy/35" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-darknavy">Select a location rule</h2>
        <p className="mt-1 text-sm text-darknavy/50">
          Review capacity, utilization, and restrictions in one workspace.
        </p>
      </div>
    );
  }

  const utilization = Number.parseInt(record.cells.utilization ?? "0", 10) || 0;
  return (
    <section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-skyblue">{record.cells.locationCode}</p>
          <h2 className="mt-1 text-lg font-semibold text-darknavy">{record.cells.locationName}</h2>
        </div>
        <ModuleStatusBadge status={record.status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RuleMetric
          icon={PackageCheck}
          label="Max weight"
          value={record.cells.maxWeight ?? "Not set"}
        />
        <RuleMetric icon={Box} label="Max volume" value={record.cells.maxVolume ?? "Not set"} />
        <RuleMetric icon={Layers3} label="Max quantity" value="1,000 pcs" />
        <RuleMetric icon={ClipboardCheck} label="Max pallets" value="2 PLT" />
      </div>
      <div className="rounded-lg border border-darknavy/8 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-darknavy">Current utilization</span>
          <span className="font-bold text-darknavy">{utilization}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-offwhite">
          <div
            className={joinClasses(
              "h-full rounded-full",
              utilization >= 80 ? "bg-amber-500" : "bg-skyblue",
            )}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <RuleDetail
          icon={ShieldCheck}
          label="Storage restrictions"
          value={record.cells.restrictions ?? "None"}
        />
        <RuleDetail
          icon={Thermometer}
          label="Temperature range"
          value={record.cells.locationCode === "COLD-01" ? "2°C – 8°C" : "15°C – 25°C"}
        />
        <RuleDetail icon={PackageCheck} label="Mixed items" value="Allowed with category checks" />
      </div>
    </section>
  );
}

function RuleMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Box;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-darknavy/8 bg-offwhite/50 p-4">
      <Icon className="h-4 w-4 text-skyblue" aria-hidden="true" />
      <p className="mt-3 text-xs font-medium text-darknavy/45">{label}</p>
      <p className="mt-1 text-base font-bold text-darknavy">{value}</p>
    </div>
  );
}

function RuleDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Box;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-darknavy/8 p-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
      <div>
        <p className="text-xs font-medium text-darknavy/45">{label}</p>
        <p className="mt-1 text-sm font-semibold text-darknavy">{value}</p>
      </div>
    </div>
  );
}
