import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsReceiptActionPage } from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptActionPage";

const PageTitle = "Edit Goods Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsReceiptEditPage() {
  return <GoodsReceiptActionPage />;
}


