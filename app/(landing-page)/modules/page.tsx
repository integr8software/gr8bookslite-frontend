import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingModulesPage } from "@/app/src/ui/landing-page/LandingModulesPage";

export const metadata: Metadata = {
	title: `Modules | ${AppName}`,
	description: `Explore the accounting, inventory, sales, purchasing, approval, and reporting modules in ${AppName}.`,
};

export default function ModulesRoute() {
	return <LandingModulesPage />;
}
