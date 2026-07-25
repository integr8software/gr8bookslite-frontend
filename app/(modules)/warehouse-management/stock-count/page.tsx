import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockCountListPage } from "@/app/src/ui/modules/warehouse-management/stock-count/WarehouseStockCountListPage";

const PageTitle = "Stock Count";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseOperationsStockCountPage() {
  return <WarehouseStockCountListPage />;
}
