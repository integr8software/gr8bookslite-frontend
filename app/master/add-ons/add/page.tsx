import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterAddOnFormPage } from "@/app/src/ui/master/add-ons/MasterAddOnFormPage";

export const metadata: Metadata = {
	title: `Add Add-On | ${AppName}`,
	description: `Add a master add-on record for ${AppName}.`,
};

export default function Page() {
	return <MasterAddOnFormPage mode="add" />;
}
