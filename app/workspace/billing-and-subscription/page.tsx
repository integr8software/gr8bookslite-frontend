import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/module/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/ModulePreviewPage";

export const metadata: Metadata = {
  title: `Billing & Subscription | ${AppName}`,
  description: `Workspace billing and subscription mockup for ${AppName}.`,
};

export default function BillingAndSubscriptionPage() {
  return <ModulePreviewPage data={ModulePreviewPages.subscriptions} />;
}
