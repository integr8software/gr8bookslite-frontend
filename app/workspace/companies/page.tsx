import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceCompaniesMain } from "@/app/src/ui/modules/workspace/companies/ui/Main";

export const metadata: Metadata = {
	title: `Companies | ${AppName}`,
	description: `Manage companies, users, and branches for ${AppName}.`,
};

export default function CompaniesPage() {
	return <WorkspaceCompaniesMain />;
}
