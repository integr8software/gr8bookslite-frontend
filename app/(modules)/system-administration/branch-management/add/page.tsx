import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BranchManagementAction } from "@/app/src/ui/modules/system-administration/branch-management/ui/Action";

const PageTitle = "Add Branch Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationBranchManagementAddPage() {
  return <BranchManagementAction />;
}
