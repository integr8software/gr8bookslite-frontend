import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Payment Methods | ${AppName}`,
	description: `Master payment methods for ${AppName}.`,
};

export default function MasterPaymentMethodsPage() {
	return <MasterPreviewPage pageKey="paymentMethods" />;
}
