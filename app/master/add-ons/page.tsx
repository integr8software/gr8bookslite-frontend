import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterAddOnListPage } from "@/app/src/ui/master/add-ons/MasterAddOnListPage";

export const metadata: Metadata = {
	title: `Add-Ons | ${AppName}`,
	description: `Master add-on records for ${AppName}.`,
};

export default function Page() {
	return <MasterAddOnListPage />;
}
