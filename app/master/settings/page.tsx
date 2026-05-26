import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AccountSettingsPage } from "@/app/src/ui/shared/account/AccountSettingsPage";

export const metadata: Metadata = {
	title: `Master Settings | ${AppName}`,
	description: `Master account settings for ${AppName}.`,
};

export default function MasterSettingsPage() {
	return <AccountSettingsPage scope="master" />;
}
