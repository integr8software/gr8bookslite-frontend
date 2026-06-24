import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FormSignatoryMaintenancePage } from "@/app/src/ui/modules/system-administration/form-signatory/FormSignatoryMaintenancePage";

const PageTitle = "Edit Form Signatory";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function EditMaintenanceFormSignatoryPage() {
	return <FormSignatoryMaintenancePage />;
}
