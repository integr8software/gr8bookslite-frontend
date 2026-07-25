import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PostDatedCheckRegistryMain } from "@/app/src/ui/modules/cash-receipt/post-dated-check-registry/Main";

const PageTitle = "Post-Dated Check Registry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptPostDatedCheckRegistryPage() {
  return <PostDatedCheckRegistryMain />;
}
