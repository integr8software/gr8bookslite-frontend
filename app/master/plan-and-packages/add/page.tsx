import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPlanAndPackageFormPage } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageFormPage";

export const metadata: Metadata = {
	title: `Add Plan | ${AppName}`,
	description: `Add a master plan and package record for ${AppName}.`,
};

export default function Page() {
	return <MasterPlanAndPackageFormPage mode="add" />;
}
