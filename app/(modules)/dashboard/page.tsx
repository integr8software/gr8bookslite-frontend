import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ManagementMain } from "@/app/src/ui/modules/dashboard/../dashboard/Main";

const PageTitle = "Dashboard";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `Customizable dashboard workspace for ${AppName}.`,
};

export default function DashboardPage() {
  return <ManagementMain />;
}
