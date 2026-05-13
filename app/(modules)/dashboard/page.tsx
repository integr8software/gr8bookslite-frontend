import type { Metadata } from "next";
import { CustomizableDashboard } from "@/app/src/ui/modules/dashboard/CustomizableDashboard";

export const metadata: Metadata = {
  title: "Dashboard | Gr8Books Lite",
  description: "Customizable dashboard workspace for Gr8Books Lite.",
};

export default function DashboardPage() {
  return <CustomizableDashboard />;
}
