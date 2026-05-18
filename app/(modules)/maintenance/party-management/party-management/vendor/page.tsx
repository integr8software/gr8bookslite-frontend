import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementVendorMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/vendor/Main";

const PageTitle = "Vendor";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementVendorPage() {
  return <PartyManagementPartyManagementVendorMain />;
}


