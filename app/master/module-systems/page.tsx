import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterModuleSystemPage } from "@/app/src/ui/master/module-systems/MasterModuleSystemPage";

export const metadata: Metadata = {
	title: `System Maintenance | ${AppName}`,
	description: `Master system maintenance for ${AppName}.`,
};

export default function ModuleSystemsPage() {
	return <MasterModuleSystemPage />;
}
