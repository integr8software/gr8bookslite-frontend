import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceBillingSubscriptionCompanyPage } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionPage";

export const metadata: Metadata = {
  title: `Company Billing | ${AppName}`,
  description: `Review company billing, invoices, payments, and subscription settings for ${AppName}.`,
};

export default async function BillingAndSubscriptionCompanyPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;

  return <WorkspaceBillingSubscriptionCompanyPage companyId={companyId} />;
}
