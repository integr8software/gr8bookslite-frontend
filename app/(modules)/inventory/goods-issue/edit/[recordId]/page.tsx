import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { GoodsIssueActionPage } from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueActionPage";

const PageTitle = "Edit Goods Issue";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryGoodsIssueEditPage() {
  return <GoodsIssueActionPage />;
}


