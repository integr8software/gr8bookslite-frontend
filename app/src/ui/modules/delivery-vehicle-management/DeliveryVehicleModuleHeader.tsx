import { Gauge, Plus, Truck, Upload, Wrench } from "lucide-react";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type DeliveryVehicleModuleHeaderProps = {
  config: DeliveryVehicleModuleConfig;
  onAdd: () => void;
  onImport: () => void;
};

export function DeliveryVehicleModuleHeader({
  config,
  onAdd,
  onImport,
}: DeliveryVehicleModuleHeaderProps) {
  const Icon =
    config.key === "vehicle-repair-maintenance"
      ? Wrench
      : config.key === "vehicle-types"
        ? Gauge
        : Truck;

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={
        <>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {config.code} - Delivery Vehicle Management
        </>
      }
      title={config.title}
      description={config.description}
      actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
      actions={
        <>
          <button
            type="button"
            onClick={onImport}
            className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            onClick={onAdd}
            className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {config.primaryAction}
          </button>
        </>
      }
    />
  );
}
