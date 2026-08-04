import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleTypeRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-types/VehicleTypesTypes";

export const VehicleTypesMockData: VehicleTypeRecord[] = [
  mock(
    "dvt-1",
    "DVT-LT",
    "Light Truck",
    "Active",
    {
      typeName: "Light Truck",
      brand: "Isuzu",
      model: "N-Series",
      bodyType: "Box Truck",
      maxPayload: "3,500 kg",
      cargoVolume: "18",
      capacityUnit: "CBM (cubic meter)",
      palletCapacity: "8",
      handling: "General cargo",
      description: "Urban and provincial palletized deliveries.",
    },
    { progress: 70 },
  ),
  mock(
    "dvt-2",
    "DVT-RV",
    "Refrigerated Van",
    "Active",
    {
      typeName: "Refrigerated Van",
      brand: "Toyota",
      model: "HiAce",
      bodyType: "Refrigerated Van",
      maxPayload: "1,200 kg",
      cargoVolume: "9",
      capacityUnit: "CBM (cubic meter)",
      palletCapacity: "4",
      handling: "Temperature controlled",
      description: "2-8 C cold-chain deliveries.",
    },
    { progress: 82 },
  ),
  mock(
    "dvt-3",
    "DVT-HT",
    "Heavy Truck",
    "Inactive",
    {
      typeName: "Heavy Truck",
      brand: "Hino",
      model: "500",
      bodyType: "Box Truck",
      maxPayload: "12,000 kg",
      cargoVolume: "42",
      capacityUnit: "CBM (cubic meter)",
      palletCapacity: "18",
      handling: "Hazardous eligible",
      description: "Inactive pending compliance review.",
    },
    { alert: "Type cannot be used for new vehicle records." },
  ),
];

export function createVehicleTypeRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("vehicle-types", "DVT", values, status);
}
