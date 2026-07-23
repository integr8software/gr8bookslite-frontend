import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PartyManagementFormPage } from "@/app/src/ui/modules/party-management/PartyManagementFormPage";

const PageTitle = "Add Party Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementAddPage() {
  return <PartyManagementFormPage />;
}
