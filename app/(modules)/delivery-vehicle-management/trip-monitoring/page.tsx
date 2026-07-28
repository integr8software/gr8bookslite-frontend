import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TripMonitoringListPage } from "@/app/src/ui/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringListPage";

const PageTitle = "Trip Monitoring";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementTripMonitoringPage() {
  return <TripMonitoringListPage />;
}
