import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FuelAndIncidentsListPage } from "@/app/src/ui/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsListPage";

const PageTitle = "Fuel & Incidents";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementFuelAndIncidentsPage() {
  return <FuelAndIncidentsListPage />;
}
