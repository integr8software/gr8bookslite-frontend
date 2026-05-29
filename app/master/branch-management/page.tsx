import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessListPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessListPage";

export const metadata: Metadata = {
	title: `Branch Management | ${AppName}`,
	description: `Master branch management for ${AppName}.`,
};

export default function MasterBranchesPage() {
	return <MasterTenantAccessListPage entity="branch" />;
}
