import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementAction } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementAction";

const PageTitle = "Edit Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementEditPage() {
  return <PartyManagementAction />;
}
