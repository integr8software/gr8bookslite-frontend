import type {
  DeliveryVehicleFeatureKey,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export function createDeliveryVehicleMockRecord(
  id: string,
  code: string,
  name: string,
  status: string,
  fields: Record<string, string>,
  options: Pick<DeliveryVehicleModuleRecord, "alert" | "category" | "progress"> = {},
): DeliveryVehicleModuleRecord {
  return {
    id,
    code,
    name,
    status,
    fields,
    createdBy: "Fleet Operations",
    updatedAt: "2026-07-25T08:30:00+08:00",
    ...options,
  };
}

export function createDeliveryVehicleModuleRecord(
  feature: DeliveryVehicleFeatureKey,
  prefix: string,
  values: Record<string, string>,
  status: string,
  category?: string,
): DeliveryVehicleModuleRecord {
  const suffix = String(Date.now()).slice(-6);
  const code = `${prefix}-${suffix}`;
  return createDeliveryVehicleMockRecord(
    `${feature}-${suffix}`,
    code,
    Object.values(values).find(Boolean) ?? code,
    status,
    values,
    { category },
  );
}

