import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryVehiclesListPage } from "@/app/src/ui/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesListPage";

const PageTitle = "Delivery Vehicles";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementDeliveryVehiclesPage() {
  return <DeliveryVehiclesListPage />;
}
