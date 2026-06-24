import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsIssueAction } from "@/app/src/ui/modules/inventory/goods-issue/Action";

const PageTitle = "Edit Goods Issue";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsIssueEditPage() {
  return <GoodsIssueAction />;
}


