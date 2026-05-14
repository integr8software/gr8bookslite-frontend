import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PartyManagementPartyManagementSupplierMain } from "@/app/src/ui/modules/maintenance/party-management/party-management/supplier/Main";

const PageTitle = "Supplier";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenancePartyManagementPartyManagementSupplierPage() {
  return <PartyManagementPartyManagementSupplierMain />;
}


