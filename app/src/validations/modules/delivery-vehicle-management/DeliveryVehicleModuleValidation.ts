import { z } from "zod";
import type { DeliveryVehicleField } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export function validateDeliveryVehicleModuleRecord(
  fields: readonly DeliveryVehicleField[],
  values: Record<string, string>,
) {
  const shape = Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.required
        ? z.string().trim().min(1, `${field.label} is required.`)
        : z.string(),
    ]),
  ) as Record<string, z.ZodType<string>>;
  const result = z.object(shape).safeParse(values);

  if (result.success) {
    return {};
  }

  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
}
