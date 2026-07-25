"use client";

import { LoadPlanningConfig } from "@/app/src/constants/modules/delivery-vehicle-management/load-planning/LoadPlanningConstants";
import { createLoadPlanRecord, LoadPlanningMockData } from "@/app/src/data/modules/delivery-vehicle-management/load-planning/LoadPlanningData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateLoadPlan } from "@/app/src/validations/modules/delivery-vehicle-management/load-planning/LoadPlanningValidation";

export function useLoadPlanningListPage() {
  return useDeliveryVehicleModuleListPage({
    config: LoadPlanningConfig,
    createRecord: createLoadPlanRecord,
    initialRecords: LoadPlanningMockData,
    validateRecord: validateLoadPlan,
  });
}
