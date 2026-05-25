import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPlanAndPackageListPage } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageListPage";

export const metadata: Metadata = {
	title: `Plan and Packages | ${AppName}`,
	description: `Master plan and package records for ${AppName}.`,
};

export default function Page() {
	return <MasterPlanAndPackageListPage />;
}
