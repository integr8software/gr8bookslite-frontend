import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MultiCurrencySetupFormPage } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupFormPage";

const PageTitle = "View Multi-Currency Setup";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function SystemAdministrationMultiCurrencySetupViewPage() {
	return <MultiCurrencySetupFormPage />;
}
