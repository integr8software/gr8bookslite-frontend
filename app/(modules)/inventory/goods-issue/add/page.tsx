import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { GoodsIssueAction } from "@/app/src/ui/modules/inventory/goods-issue/Action";

const PageTitle = "Add Goods Issue";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsIssueAddPage() {
  return <GoodsIssueAction />;
}


