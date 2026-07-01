import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ProductDistributionCenterWarehouseAction } from "@/app/src/ui/modules/cash-receipt/product-distribution-center-warehouse/Action";

const PageTitle = "View Product Distribution Center Warehouse";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProductDistributionCenterWarehouseViewPage() {
  return <ProductDistributionCenterWarehouseAction />;
}


