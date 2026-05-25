import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPlanAndPackageDetailsPage } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageDetailsPage";

export const metadata: Metadata = {
	title: `View Plan | ${AppName}`,
	description: `View a master plan and package record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterPlanAndPackageDetailsPage recordId={recordId} />;
}
