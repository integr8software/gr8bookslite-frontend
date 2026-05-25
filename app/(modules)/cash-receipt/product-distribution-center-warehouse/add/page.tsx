import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ProductDistributionCenterWarehouseAction } from "@/app/src/ui/modules/cash-receipt/product-distribution-center-warehouse/Action";

const PageTitle = "Add Product Distribution Center Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProductDistributionCenterWarehouseAddPage() {
  return <ProductDistributionCenterWarehouseAction />;
}


