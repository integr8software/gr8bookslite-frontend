import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPromotionFormPage } from "@/app/src/ui/master/promotions/MasterPromotionFormPage";

export const metadata: Metadata = {
	title: `Edit Promotion | ${AppName}`,
	description: `Edit a master promotion record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterPromotionFormPage mode="edit" recordId={recordId} />;
}
