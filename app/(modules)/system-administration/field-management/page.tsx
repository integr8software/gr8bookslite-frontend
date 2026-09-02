import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FieldManagementPage } from "@/app/src/ui/modules/system-administration/field-management/FieldManagementPage";

const PageTitle = "Field Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationFieldManagementPage() {
	return <FieldManagementPage />;
}
