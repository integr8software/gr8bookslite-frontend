import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseItemAvailabilityListPage } from "@/app/src/ui/modules/warehouse-management/item-availability/WarehouseItemAvailabilityListPage";

const PageTitle = "Item Availability";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseInventoryItemAvailabilityPage() {
  return <WarehouseItemAvailabilityListPage />;
}
