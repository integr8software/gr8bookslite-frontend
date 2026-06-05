import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceBillingSubscriptionPage } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionPage";

export const metadata: Metadata = {
  title: `Billing & Subscription | ${AppName}`,
  description: `Workspace billing, card selection, pricing, and promotion application for ${AppName}.`,
};

export default function BillingAndSubscriptionPage() {
  return <WorkspaceBillingSubscriptionPage />;
}
