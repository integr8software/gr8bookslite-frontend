import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MailMaintenanceMain } from "@/app/src/ui/modules/system-administration/mail-maintenance/Main";

const PageTitle = "Mail Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationMailMaintenancePage() {
  return <MailMaintenanceMain />;
}


