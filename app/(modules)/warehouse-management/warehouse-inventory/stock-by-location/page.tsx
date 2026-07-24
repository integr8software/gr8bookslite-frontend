import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockByLocationListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory/stock-by-location/WarehouseStockByLocationListPage";

const PageTitle = "Stock by Location";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseInventoryStockByLocationPage() {
  return <WarehouseStockByLocationListPage />;
}
