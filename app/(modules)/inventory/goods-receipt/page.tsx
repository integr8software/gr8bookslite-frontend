import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsReceiptOverviewPage } from "@/app/src/ui/modules/inventory/goods-receipt/overview/GoodsReceiptOverviewPage";

const PageTitle = "Goods Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsReceiptPage() {
  return <GoodsReceiptOverviewPage />;
}


