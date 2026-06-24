import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsIssueMain } from "@/app/src/ui/modules/inventory/goods-issue/Main";

const PageTitle = "Goods Issue";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsIssuePage() {
  return <GoodsIssueMain />;
}


