import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingPage } from "@/app/src/ui/landing-page/LandingPage";

export const metadata: Metadata = {
  title: `${AppName} | Accounting and Inventory SaaS`,
  description:
    "Accounting, inventory, purchasing, sales, approvals, and reporting in one clean SaaS workspace.",
};

export default function Page() {
  return <LandingPage />;
}
