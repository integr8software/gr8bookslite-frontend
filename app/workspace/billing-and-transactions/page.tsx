import { redirect } from "next/navigation";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";

export default function BillingAndTransactionsRedirectPage() {
  redirect(WorkspaceBillingSubscriptionHref);
}
