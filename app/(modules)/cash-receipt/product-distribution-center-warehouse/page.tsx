import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ProductDistributionCenterWarehouseMain } from "@/app/src/ui/modules/cash-receipt/product-distribution-center-warehouse/Main";

const PageTitle = "Product Distribution Center Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProductDistributionCenterWarehousePage() {
  return <ProductDistributionCenterWarehouseMain />;
}


