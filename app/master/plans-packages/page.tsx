import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PlansPackagesPage } from "@/app/src/ui/modules/workspace/plans-packages/PlansPackagesPage";

export const metadata: Metadata = {
	title: `Plans & Packages | ${AppName}`,
	description: `Master plans and packages for ${AppName}.`,
};

export default function MasterPlansPackagesPage() {
	return <PlansPackagesPage />;
}
