import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WarehouseStockAdjustmentListPage } from "@/app/src/ui/modules/warehouse-management/warehouse-operations/stock-adjustment/WarehouseStockAdjustmentListPage";

const PageTitle = "Stock Adjustment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function WarehouseOperationsStockAdjustmentPage() {
  return <WarehouseStockAdjustmentListPage />;
}
