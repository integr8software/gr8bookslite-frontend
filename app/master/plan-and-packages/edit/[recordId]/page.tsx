import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPlanAndPackageFormPage } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageFormPage";

export const metadata: Metadata = {
	title: `Edit Plan | ${AppName}`,
	description: `Edit a master plan and package record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterPlanAndPackageFormPage mode="edit" recordId={recordId} />;
}
