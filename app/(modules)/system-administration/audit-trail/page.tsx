import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { AuditTrailMain } from "@/app/src/ui/modules/system-administration/audit-trail/Main";

const PageTitle = "Audit Trail";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationAuditTrailPage() {
  return <AuditTrailMain />;
}


