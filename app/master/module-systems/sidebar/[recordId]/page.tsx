import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterModuleSystemSidebarPage } from "@/app/src/ui/master/module-systems/MasterModuleSystemPage";

export const metadata: Metadata = {
	title: `System Sidebar | ${AppName}`,
	description: `Configure master module system sidebar for ${AppName}.`,
};

type ModuleSystemSidebarPageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function ModuleSystemSidebarPage({
	params,
}: ModuleSystemSidebarPageProps) {
	const { recordId } = await params;

	return <MasterModuleSystemSidebarPage recordId={recordId} />;
}
