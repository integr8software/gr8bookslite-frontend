import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryTripsAndDispatchListPage } from "@/app/src/ui/modules/delivery-vehicle-management/delivery-trips-and-dispatch/DeliveryTripsAndDispatchListPage";

const PageTitle = "Delivery Trips & Dispatch";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementDeliveryTripsAndDispatchPage() {
  return <DeliveryTripsAndDispatchListPage />;
}
