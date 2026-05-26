import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { BranchManagementActionPage } from "@/app/src/ui/modules/system-administration/branch-management/BranchManagementActionPage";

const PageTitle = "Add Branch Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationBranchManagementAddPage() {
	return <BranchManagementActionPage />;
}
