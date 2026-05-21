import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DepartmentFormPage } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentFormPage";

const PageTitle = "View User Group";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationDepartmentViewPage() {
	return <DepartmentFormPage />;
}
