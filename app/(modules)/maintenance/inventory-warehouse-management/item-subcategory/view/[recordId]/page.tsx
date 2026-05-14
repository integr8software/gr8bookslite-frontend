import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemSubcategoryAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-subcategory/Action";

const PageTitle = "View Item Subcategory";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemSubcategoryViewPage() {
  return <InventoryWarehouseManagementItemSubcategoryAction />;
}


