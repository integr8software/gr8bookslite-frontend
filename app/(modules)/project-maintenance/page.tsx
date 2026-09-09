import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ProjectMaintenanceListPage } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceListPage";

const PageTitle = "Project Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceProjectMaintenancePage() {
  return <ProjectMaintenanceListPage />;
}
