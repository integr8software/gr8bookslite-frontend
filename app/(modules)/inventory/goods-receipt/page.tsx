import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsReceiptListPage } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptListPage";

const PageTitle = "Goods Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsReceiptPage() {
  return <GoodsReceiptListPage />;
}


