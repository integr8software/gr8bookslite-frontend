import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementCustomerMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/customer/Main";

const PageTitle = "Customer";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementCustomerPage() {
  return <PartyManagementPartyManagementCustomerMain />;
}


