import type { Metadata } from "next";
import { DashboardManagement } from "@/app/src/ui/modules/dashboard/DashboardManagement";

export const metadata: Metadata = {
  title: "Dashboard | Gr8Books Lite",
  description: "Customizable dashboard workspace for Gr8Books Lite.",
};

export default function DashboardPage() {
  return <DashboardManagement />;
}
