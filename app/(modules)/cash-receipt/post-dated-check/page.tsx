import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PostDatedCheckOverviewPage } from "@/app/src/ui/modules/cash-receipt/post-dated-check/overview/PostDatedCheckOverviewPage";

const PageTitle = "Post Dated Check";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptPostDatedCheckPage() {
  return <PostDatedCheckOverviewPage />;
}
