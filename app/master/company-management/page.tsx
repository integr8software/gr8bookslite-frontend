import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessListPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessListPage";

export const metadata: Metadata = {
	title: `Company Management | ${AppName}`,
	description: `Manage subscribed companies for ${AppName}.`,
};

export default function MasterCompaniesPage() {
	return <MasterTenantAccessListPage entity="company" />;
}
