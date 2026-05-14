import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BranchManagementMain } from "@/app/src/ui/modules/system-administration/branch-management/Main";

const PageTitle = "Branch Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationBranchManagementPage() {
  return <BranchManagementMain />;
}
