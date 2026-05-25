import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { GoodsReceiptMain } from "@/app/src/ui/modules/inventory/goods-receipt/Main";

const PageTitle = "Goods Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsReceiptPage() {
  return <GoodsReceiptMain />;
}


