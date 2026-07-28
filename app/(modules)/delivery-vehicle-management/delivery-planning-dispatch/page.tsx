import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryPlanningDispatchListPage } from "@/app/src/ui/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchListPage";

const PageTitle = "Delivery Planning & Dispatch";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementDeliveryPlanningDispatchPage() {
  return <DeliveryPlanningDispatchListPage />;
}
