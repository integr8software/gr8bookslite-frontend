import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterAddOnFormPage } from "@/app/src/ui/master/add-ons/MasterAddOnFormPage";

export const metadata: Metadata = {
	title: `Edit Add-On | ${AppName}`,
	description: `Edit a master add-on record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterAddOnFormPage mode="edit" recordId={recordId} />;
}
