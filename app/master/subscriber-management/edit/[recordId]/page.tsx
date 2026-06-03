import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberManagementFormPage } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementFormPage";

export const metadata: Metadata = {
	title: `Edit Subscriber | ${AppName}`,
	description: `Edit a master subscriber record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
	searchParams: Promise<{ from?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { recordId } = await params;
	const { from } = await searchParams;

	return (
		<MasterSubscriberManagementFormPage
			mode="edit"
			recordId={recordId}
			returnSource={from === "view" ? "view" : "list"}
		/>
	);
}
