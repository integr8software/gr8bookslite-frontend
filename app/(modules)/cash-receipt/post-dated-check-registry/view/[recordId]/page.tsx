import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PostDatedCheckRegistryAction } from "@/app/src/ui/modules/cash-receipt/post-dated-check-registry/Action";

const PageTitle = "View Post-Dated Check";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptPostDatedCheckRegistryViewPage() {
  return <PostDatedCheckRegistryAction />;
}
