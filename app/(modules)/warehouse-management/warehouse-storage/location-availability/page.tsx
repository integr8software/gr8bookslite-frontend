import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseLocationAvailabilityListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/location-availability/WarehouseLocationAvailabilityListPage";

const PageTitle = "Location Availability";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseStorageLocationAvailabilityPage() {
  return <WarehouseLocationAvailabilityListPage />;
}
