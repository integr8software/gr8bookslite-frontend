import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { BranchManagementMain } from "@/app/src/ui/modules/system-administration/branch-management/BranchManagementMain";

const PageTitle = "Branch Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationBranchManagementPage() {
	return <BranchManagementMain />;
}
