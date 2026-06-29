import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterModuleSystemFormPage } from "@/app/src/ui/master/module-systems/MasterModuleSystemPage";

export const metadata: Metadata = {
	title: `Edit System | ${AppName}`,
	description: `Edit master module system for ${AppName}.`,
};

type EditModuleSystemPageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function EditModuleSystemPage({
	params,
}: EditModuleSystemPageProps) {
	const { recordId } = await params;

	return <MasterModuleSystemFormPage mode="edit" recordId={recordId} />;
}
