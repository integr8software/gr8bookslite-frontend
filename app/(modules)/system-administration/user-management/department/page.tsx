import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DepartmentPage } from "@/app/src/ui/modules/system-administration/user-management/department/DepartmentPage";

const PageTitle = "Department";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationDepartmentPage() {
	return <DepartmentPage />;
}
