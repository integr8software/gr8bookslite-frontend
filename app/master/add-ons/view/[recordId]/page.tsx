import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterAddOnDetailsPage } from "@/app/src/ui/master/add-ons/MasterAddOnDetailsPage";

export const metadata: Metadata = {
	title: `View Add-On | ${AppName}`,
	description: `View a master add-on record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterAddOnDetailsPage recordId={recordId} />;
}
