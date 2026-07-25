import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseCapacityStorageRulesListPage } from "@/app/src/ui/modules/warehouse-management/capacity-storage-rules/WarehouseCapacityStorageRulesListPage";

const PageTitle = "Capacity & Storage Rules";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseStorageCapacityStorageRulesPage() {
  return <WarehouseCapacityStorageRulesListPage />;
}
