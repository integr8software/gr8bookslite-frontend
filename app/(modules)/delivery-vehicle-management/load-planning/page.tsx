import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LoadPlanningListPage } from "@/app/src/ui/modules/delivery-vehicle-management/load-planning/LoadPlanningListPage";

const PageTitle = "Load Planning";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementLoadPlanningPage() {
  return <LoadPlanningListPage />;
}
