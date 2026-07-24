import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseItemLocationSetupListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/item-location-setup/WarehouseItemLocationSetupListPage";

const PageTitle = "Item Location Setup";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseStorageItemLocationSetupPage() {
  return <WarehouseItemLocationSetupListPage />;
}
