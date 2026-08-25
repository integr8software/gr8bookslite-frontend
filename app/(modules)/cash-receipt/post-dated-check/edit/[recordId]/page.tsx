import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PostDatedCheckActionPage } from "@/app/src/ui/modules/cash-receipt/post-dated-check/action/PostDatedCheckActionPage";

const PageTitle = "Edit Post Dated Check";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptPostDatedCheckEditPage() {
  return <PostDatedCheckActionPage />;
}
