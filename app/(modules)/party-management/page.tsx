import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PartyManagementListPage } from "@/app/src/ui/modules/party-management/PartyManagementListPage";

const PageTitle = "Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPage() {
  return <PartyManagementListPage />;
}
