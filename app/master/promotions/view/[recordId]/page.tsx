import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPromotionDetailsPage } from "@/app/src/ui/master/promotions/MasterPromotionDetailsPage";

export const metadata: Metadata = {
	title: `View Promotion | ${AppName}`,
	description: `View a master promotion record for ${AppName}.`,
};

type PageProps = {
	params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
	const { recordId } = await params;

	return <MasterPromotionDetailsPage recordId={recordId} />;
}
