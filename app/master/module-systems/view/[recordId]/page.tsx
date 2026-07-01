import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterModuleSystemDetailsPage } from "@/app/src/ui/master/module-systems/MasterModuleSystemPage";

export const metadata: Metadata = {
	title: `View System | ${AppName}`,
	description: `View master module system for ${AppName}.`,
};

type ViewModuleSystemPageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function ViewModuleSystemPage({
	params,
}: ViewModuleSystemPageProps) {
	const { recordId } = await params;

	return <MasterModuleSystemDetailsPage recordId={recordId} />;
}
