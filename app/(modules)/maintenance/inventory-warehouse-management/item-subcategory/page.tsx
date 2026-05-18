import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemSubcategoryMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-subcategory/Main";

const PageTitle = "Item Subcategory";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemSubcategoryPage() {
  return <InventoryWarehouseManagementItemSubcategoryMain />;
}


