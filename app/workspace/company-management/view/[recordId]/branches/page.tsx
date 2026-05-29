import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CompanyBranchesPage } from "@/app/src/ui/workspace/companies/CompanyBranchesPage";

export const metadata: Metadata = {
	title: `Company Branches | ${AppName}`,
	description: `Manage workspace company branches for ${AppName}.`,
};

export default function ViewCompanyBranchesPage() {
	return <CompanyBranchesPage />;
}
