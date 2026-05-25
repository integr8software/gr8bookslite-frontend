import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { GoodsReceiptAction } from "@/app/src/ui/modules/inventory/goods-receipt/Action";

const PageTitle = "Edit Goods Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsReceiptEditPage() {
  return <GoodsReceiptAction />;
}


