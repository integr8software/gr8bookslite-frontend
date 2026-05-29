import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterTenantAccessActionPage } from "@/app/src/ui/master/tenant-access/MasterTenantAccessActionPage";

export const metadata: Metadata = {
	title: `Add User | ${AppName}`,
	description: `Create a master user record for ${AppName}.`,
};

export default function Page() {
	return <MasterTenantAccessActionPage entity="user" mode="add" />;
}
