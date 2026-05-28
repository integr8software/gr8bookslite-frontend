import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPromotionFormPage } from "@/app/src/ui/master/promotions/MasterPromotionFormPage";

export const metadata: Metadata = {
	title: `Edit Promotion | ${AppName}`,
	description: `Edit a master promotion record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
	searchParams: Promise<{ from?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { recordId } = await params;
	const { from } = await searchParams;
	const returnSource = from === "view" ? "view" : "list";

	return (
		<MasterPromotionFormPage
			mode="edit"
			recordId={recordId}
			returnSource={returnSource}
		/>
	);
}
